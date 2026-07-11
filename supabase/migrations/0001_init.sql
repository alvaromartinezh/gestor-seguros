-- Esquema mínimo para sincronizar la cartera entre dispositivos del mismo
-- usuario. RLS obligatorio desde el primer momento: cada fila solo es
-- visible o editable por su propio dueño (auth.uid() = user_id).

create table if not exists perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  foto text not null default '',
  companias text[] not null default '{}',
  dias_aviso int not null default 30
);

create table if not exists polizas (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null default '',
  telefono text not null default '',
  email text not null default '',
  dni text not null default '',
  tipo text not null default '',
  compania text not null default '',
  coche text not null default '',
  matricula text not null default '',
  fecha_contratacion text not null default '',
  fecha_vencimiento text not null default '',
  precio numeric not null default 0,
  notas text not null default '',
  demo boolean not null default false
);

create index if not exists polizas_user_id_idx on polizas (user_id);

alter table perfiles enable row level security;
alter table polizas enable row level security;

create policy "propio perfil" on perfiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "propias polizas" on polizas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
