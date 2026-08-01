create table if not exists public.ideas (
  id bigint generated always as identity primary key,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

insert into public.ideas (title)
select title
from (
  values
    ('AI-powered plant doctor that diagnoses houseplant ailments from a photo'),
    ('Recipe app that turns whatever is in your fridge into a meal plan'),
    ('Social app for swapping half-read books with neighbors')
) as seed(title)
where not exists (select 1 from public.ideas);
