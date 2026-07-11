# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gestor de Seguros: a desktop (Windows, via Electron) and Android (via
Capacitor) app for an insurance agent to manage a client policy portfolio —
clients, expirations, renewal reminders, calendar, cloud sync, backup. Not a
web app; it ships as an installable `.exe`/portable and a signed `.apk`.
Everything (UI copy, comments, identifiers) is in Spanish.

## Commands

```bash
npm install                # install deps
npm run dev                 # Vite dev server at http://localhost:5173 (browser, no native shell)
npm run check                # type-check: svelte-check + TS
npm run test                  # run all Vitest tests once
npm run test:watch             # Vitest watch mode
npx vitest run tests/dominio.test.ts        # run a single test file
npx vitest run -t "nombre del test"          # run tests matching a name
npm run build                  # compile the SPA to dist/
npm run electron                 # build + launch the desktop shell locally
npm run dist:win                   # electron-builder → release/ (installer + portable .exe)
npm run android:sync                # sync-version + build + `cap sync android`
npm run android:build                 # release APK (signed) → android/app/build/outputs/apk/release/
npm run android:build:debug            # debug APK, faster, unsigned
```

Releasing (see "CI/CD" below) is `npm version patch|minor|major && git push --follow-tags` — do not build/publish installers by hand outside this flow unless explicitly asked.

## Architecture

Clean/hexagonal architecture, strict dependency direction `presentacion` → `aplicacion` → `dominio`, with `infraestructura` implementing `aplicacion`'s port interfaces (dependency inversion). This split is load-bearing for this codebase — new features should respect it, not bypass it:

- **`src/dominio/`** — entities and business rules, zero I/O, zero framework deps. `catalogos.ts` holds seed data (insurance companies, policy types) so nothing is hardcoded in the UI; `estado.ts` computes policy status (vigente/próximo/vencido) from a caller-supplied `diasAviso` (never a hardcoded constant — it's a per-profile setting).
- **`src/aplicacion/`** — use cases (`casos-uso/ServicioPolizas.ts`, `ServicioPerfil.ts`, `ServicioBackup.ts`) orchestrating domain rules through **ports** (`puertos/*.ts` — interfaces only: `RepositorioPolizas`, `RepositorioPerfil`, `Notificador`, `AlmacenBackup`, `ComprobadorActualizaciones`, `Autenticacion`). `consultas/consultasPolizas.ts` holds pure read-model functions (filtering, stats, agenda) that both the services and the Svelte store call directly — the store calls them directly (not through the service's internal cache) so Svelte 5's fine-grained reactivity can actually track the `$state` array being read.
- **`src/infraestructura/`** — concrete adapters per platform. `entorno.ts` is the **single place in the whole app** that branches on platform (`detectarPlataforma()` → `'electron' | 'capacitor' | 'web'`) and wires up the right adapters; nothing else should do platform detection. Subfolders: `almacenamiento/` (local JSON storage per platform), `notificaciones/` (native renewal notifications), `backup/` (export/import file), `actualizaciones/` (update checker), `nube/` (Supabase — see below).
- **`src/presentacion/`** — Svelte 5 (runes) UI. `estado/store.svelte.ts` is a single class-based store instantiated once (`export const store = new AppStore()`) that composes the services/adapters and exposes `$state`/getters to components; it's the composition root's consumer, not a second composition root. `App.svelte` gates top-level view state in order: `!listo` (loading) → `!sesion` (Login) → `!perfil` (Onboarding) → normal app shell.

Adding a platform (e.g. iOS) means writing one new adapter class per port and one new branch in `entorno.ts::construirAdaptadores()` — no changes to `aplicacion` or the view components.

### Cloud sync (`src/infraestructura/nube/`)

Data lives in Supabase (Postgres + Auth), project `nxdyaoxclywqggwtjbux` (eu-north-1). Schema is versioned in `supabase/migrations/` (RLS-protected: `auth.uid() = user_id` on every table — always add RLS policies in the same migration as any new table). `RepositorioPolizasSupabase`/`RepositorioPerfilSupabase` wrap a local platform adapter (the same ones from `almacenamiento/`) as a **read cache**: `cargar()` tries Supabase first, falls back to the local cache on network failure and sets `estadoConexion.sinConexion = true`; `guardar()` only writes to Supabase and throws on failure (no offline write queue — the store catches the throw and shows a toast, see `store.svelte.ts::avisarSinConexion`). On first-ever login, if the cloud is empty but the local cache has pre-sync data, it's uploaded once automatically (idempotent — cloud won't be empty on the next check).

Login is passwordless: 6-digit email code via `supabase.auth.signInWithOtp`/`verifyOtp` (type `'email'`), not a magic link — a magic link would need a custom URL-scheme handler registered in the Windows installer to reopen the desktop app, which was deliberately avoided. **Supabase's free tier cannot customize the auth email template with its default mail sender**, so the project uses Resend as custom SMTP (`supabase/config.toml` → `[auth.email.smtp]`, template at `supabase/templates/magic_link.html`, which is the file Supabase's "magic link" email type uses even for OTP-only codes). Config changes go out via `RESEND_API_KEY=... npx supabase config push` (the key is never committed — passed as a local env var at push time). `SUPABASE_URL`/`SUPABASE_ANON_KEY` in `infraestructura/nube/config.ts` are plain source constants (the anon key is meant to be public; RLS is what protects data), same pattern as `REPO_OWNER`/`REPO_NAME` in `infraestructura/actualizaciones/config.ts`.

### Electron shell (`electron/*.cjs`)

Plain CommonJS, not part of the Vite build — `main.cjs` creates the window, tray (minimize-to-tray, not quit-on-close, so it stays alive to check for renewals/updates), registers IPC handlers, and wires `almacen.cjs` (atomic JSON file read/write in `userData`), `notificaciones.cjs` (dedup'd native notifications, tracks which reminders were already shown), and `actualizaciones.cjs` (wraps `electron-updater`, checks every 6h). `preload.cjs` exposes `window.gestorSeguros` via `contextBridge`; its exact shape must stay in sync with `src/infraestructura/electronBridge.d.ts`.

### CI/CD (`.github/workflows/build.yml`)

Push to `main`: `comprobar` job only (check + test + build, no publish). Push of a `vX.Y.Z` tag (created by `npm version`): `build-windows` (windows-latest, `electron-builder --win --publish always`) then `build-android` (ubuntu-latest, needs `build-windows` to finish first — deliberately sequential so both jobs don't race to create the same GitHub Release), which decodes the Android signing keystore from repo secrets (`ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`/`ANDROID_KEY_ALIAS`/`ANDROID_KEY_PASSWORD`), runs `sync-version` (derives `versionCode` from semver in `android/app/build.gradle` via `scripts/sync-version.mjs`), and publishes the APK to the same Release. **The Android keystore cannot be regenerated** — it's the only key Android will trust as "the same app" for future updates; if it's ever lost, every existing install needs to be uninstalled first.

Installed apps self-update from these GitHub Releases: Electron via `electron-updater` polling in the main process (silent download, prompt to restart), Android via a banner that opens the `.apk` release asset in the browser (no silent background install possible for sideloaded APKs by OS design) — both driven through the `ComprobadorActualizaciones` port.

## Testing

Vitest. `tests/fakes.ts` and `tests/fakeSupabase.ts` provide in-memory/fake adapters implementing the real port interfaces (not mocks of internals) — prefer this pattern for new adapter tests. The Supabase client is swapped via `vi.mock` + `vi.hoisted` on `infraestructura/nube/clienteSupabase.ts` (see `tests/nube.test.ts`) since the adapters import a module-level singleton rather than taking the client as a constructor argument.
