alter table public.colleges enable row level security;
alter table public.courses enable row level security;
alter table public.years enable row level security;

drop policy if exists "Admins can manage colleges" on public.colleges;
drop policy if exists "Admins can manage courses" on public.courses;
drop policy if exists "Admins can manage years" on public.years;
drop policy if exists "Anyone can read colleges" on public.colleges;
drop policy if exists "Anyone can read courses" on public.courses;
drop policy if exists "Anyone can read years" on public.years;

create policy "Anyone can read colleges"
  on public.colleges
  for select
  using (true);

create policy "Anyone can read courses"
  on public.courses
  for select
  using (true);

create policy "Anyone can read years"
  on public.years
  for select
  using (true);

create policy "Admins can manage colleges"
  on public.colleges
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  );

create policy "Admins can manage courses"
  on public.courses
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  );

create policy "Admins can manage years"
  on public.years
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'superadmin')
    )
  );
