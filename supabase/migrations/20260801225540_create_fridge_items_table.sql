create table if not exists public.fridge_items (
  id bigint generated always as identity primary key,
  name text not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.fridge_items enable row level security;
