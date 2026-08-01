create table if not exists public.saved_recipes (
  id bigint generated always as identity primary key,
  title text not null,
  steps text[] not null default '{}',
  used_ingredients text[] not null default '{}',
  missing_items text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.saved_recipes enable row level security;
