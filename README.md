# Gestor de Seguros

Aplicación de escritorio (Windows) y Android para gestionar una cartera de
pólizas de seguros: clientes, vencimientos, avisos de renovación, calendario
y copia de seguridad. Pensada para un agente/mediador de seguros; todos los
datos se guardan **en el dispositivo**, no hay servidor ni cuenta en la nube.

## Arquitectura

```
src/
  dominio/          Entidades y reglas de negocio puras (sin I/O)
  aplicacion/        Casos de uso (ServicioPolizas, ServicioPerfil, ServicioBackup)
                      + puertos (interfaces) que definen lo que necesita cada caso de uso
  infraestructura/    Adaptadores concretos de cada puerto: Electron, Capacitor y Web (dev)
  presentacion/       UI en Svelte 5 (vistas, componentes, store)
electron/             Proceso principal de Electron (ventana, bandeja, IPC, notificaciones)
android/               Proyecto nativo generado por Capacitor
tests/                 Tests de dominio y aplicación (Vitest)
```

La regla de dependencia va siempre hacia dentro: `presentacion` → `aplicacion`
→ `dominio`. `infraestructura` implementa las interfaces de `aplicacion`
(patrón puerto/adaptador), así que cambiar de plataforma o añadir una nueva
(por ejemplo iOS en el futuro) solo exige un adaptador nuevo, sin tocar
lógica de negocio. Ver `src/infraestructura/entorno.ts`: es el único sitio
del código que detecta en qué plataforma se ejecuta.

Nada de compañías, tipos de seguro o "días de aviso" está hardcodeado en la
UI: viven en `src/dominio/catalogos.ts` (semilla) y en el perfil del agente,
editables desde la app.

## Requisitos para desarrollar

- Node.js 20+ y npm
- Para compilar el instalador de Windows: nada adicional en Linux/macOS
  (electron-builder se encarga); en Windows hace falta tenerlo instalado.
- Para compilar el APK de Android: JDK 17 y el SDK de Android (ver más abajo).

## Comandos

```bash
npm install          # instala dependencias
npm run dev           # servidor de desarrollo en el navegador (http://localhost:5173)
npm run check          # comprueba tipos (TypeScript + Svelte)
npm run test            # tests de dominio/aplicación (Vitest)
npm run build             # compila la SPA a dist/
npm run electron           # compila y abre la app de escritorio en esta máquina
npm run dist:win             # genera el instalador de Windows en release/
npm run android:sync          # compila la SPA y la copia al proyecto Android
npm run android:build          # compila el APK de release (firmado)
npm run android:build:debug     # compila el APK de debug (sin firmar, más rápido)
```

## Generar el instalador de Windows

```bash
npm run dist:win
```

El resultado queda en `release/`: un instalador `.exe` (NSIS, con acceso
directo de escritorio y menú inicio) y una versión portable `.exe` que no
necesita instalación. Si se compila desde Linux/macOS sin `wine` instalado,
electron-builder puede generar solo la versión portable — en ese caso basta
con copiar el `.exe` portable al ordenador de destino.

La app de escritorio se instala con inicio automático al arrancar sesión y
vive en la bandeja del sistema (icono junto al reloj) para poder avisar de
renovaciones aunque esté minimizada. Cerrar la ventana la manda a la
bandeja; "Salir" desde el icono de la bandeja la cierra de verdad.

## Generar el APK de Android

**Esta máquina ya tiene todo instalado y el primer APK ya está generado en
`release/GestorDeSeguros.apk`.** Esta sección es para volver a montar el
entorno en otra máquina, o como referencia de lo que se instaló.

### 1. Instalar JDK y el SDK de Android (una sola vez)

La forma más sencilla es instalar **Android Studio**
(https://developer.android.com/studio), abrirlo una vez y dejar que instale
el SDK por defecto (SDK Manager → Android 15 / API 35, Build-Tools,
Platform-Tools). Android Studio ya incluye un JDK compatible.

Alternativa por línea de comandos (Linux, como se hizo en esta máquina). Hace
falta **tanto JDK 17 (para Gradle) como JDK 21** (algunos módulos nativos de
Capacitor 7 exigen toolchain 21 para compilar, aunque Gradle se ejecute con
17):

```bash
sudo pacman -S jdk17-openjdk jdk21-openjdk wine   # wine solo hace falta para
                                                    # el instalador de Windows
                                                    # si compilas desde Linux
# Descargar las "command line tools" del SDK de Android y luego:
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk"   # el que usa gradlew para compilar
```

### 2. Generar la clave de firma (una sola vez)

Un APK "de verdad" (no depuración) tiene que ir firmado. Como esta app no se
publica en Google Play, sirve un certificado propio autofirmado, generado
una vez y reutilizado en cada build:

```bash
cd android
keytool -genkeypair -v -keystore gestor-seguros-release.jks \
  -alias gestor-seguros -keyalg RSA -keysize 2048 -validity 10000
cp keystore.properties.example keystore.properties
# edita keystore.properties con la contraseña que hayas puesto en keytool
```

> **Importante — no se puede regenerar:** `android/gestor-seguros-release.jks`
> y `android/keystore.properties` (ya generados en esta máquina, con
> contraseña aleatoria) son la única clave con la que Android reconocerá que
> una versión futura del APK "es la misma app". Si se pierden, cualquier
> actualización futura obligará a desinstalar la app del móvil de tu padre
> primero (perdiendo los datos locales si no se ha exportado antes una copia
> de seguridad). Haz una copia de esos dos archivos en un sitio seguro fuera
> de este ordenador (no van en git, están en `.gitignore` a propósito).

### 3. Compilar

```bash
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk"   # gradlew necesita el 21
npm run android:build          # APK de release, firmado, en android/app/build/outputs/apk/release/
```

Ese `.apk` es el archivo que se le pasa al usuario final para instalar
"como si fuera de la Play Store" (tendrá que aceptar la instalación desde
"orígenes desconocidos" la primera vez, ya que no viene de una tienda).

En Android, los avisos de renovación son notificaciones locales reales
(programadas por el sistema operativo): funcionan aunque la app esté
cerrada del todo.

## Publicar una actualización

El repositorio es <https://github.com/alvaromartinezh/gestor-seguros>. Cada
push a `main` solo valida (tests + build) vía GitHub Actions, sin publicar
nada — para que un commit a medias no le llegue a nadie. Publicar una
versión real es un solo comando:

```bash
npm version patch          # o minor / major — sube package.json y crea el tag vX.Y.Z
git push --follow-tags
```

Eso dispara un workflow que compila **el instalador de Windows y el APK de
Android en los servidores de GitHub** (sin depender de esta máquina) y los
publica en una Release de GitHub. A partir de ahí:

- **Windows**: la app ya instalada la detecta sola (comprueba cada 6 h y al
  abrir), la descarga en segundo plano y se instala al reiniciar — banner
  "Hay una versión nueva" con botón "Actualizar y reiniciar".
- **Android**: Android no deja autoactualizar apps fuera de la Play Store en
  segundo plano, así que la app muestra el mismo banner con "Descargar
  actualización", que abre el `.apk` de la Release en el navegador — el
  usuario confirma la instalación con un par de toques, como la primera vez.

**Importante**: la `v1.0.1` (la primera con esta comprobación de
actualizaciones) es la primera versión capaz de auto-actualizarse. Si el
móvil/ordenador de tu padre tiene una versión anterior instalada, esa
primera actualización hay que dársela tú a mano una vez (como se hizo al
principio); a partir de ahí ya tira sola.

## Copia de seguridad

Desde **Perfil → Copia de seguridad** se puede exportar toda la cartera a un
archivo, y restaurarla en otro dispositivo o tras una reinstalación.
Recomendado hacerlo antes de actualizaciones grandes o de forma periódica.
