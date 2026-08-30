-- ============================================================
-- FIX SUPABASE ROW LEVEL SECURITY (RLS) FOR DISHES TABLE
-- Run this script in your Supabase SQL Editor:
-- https://app.supabase.com -> SQL Editor -> New Query
-- ============================================================

-- 1. Enable RLS on dishes table
alter table public.dishes enable row level security;

-- 2. Allow PUBLIC (unauthenticated guests) to read dishes on website frontend
drop policy if exists "public_read_dishes" on public.dishes;
create policy "public_read_dishes"
  on public.dishes 
  for select 
  using (true);

-- 3. Allow AUTHENTICATED users (admins) to insert, update, delete dishes
drop policy if exists "admin_write_dishes" on public.dishes;
create policy "admin_write_dishes"
  on public.dishes 
  for all 
  using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');
