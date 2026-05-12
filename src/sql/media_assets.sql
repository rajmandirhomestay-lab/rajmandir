-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values 
('hero-assets', 'hero-assets', true),
('room-categories', 'room-categories', true),
('physical-room-images', 'physical-room-images', true),
('dining-images', 'dining-images', true),
('experience-images', 'experience-images', true),
('travel-stories', 'travel-stories', true),
('gallery-images', 'gallery-images', true),
('testimonial-assets', 'testimonial-assets', true),
('offers-banners', 'offers-banners', true),
('dining-menu-assets', 'dining-menu-assets', true),
('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- ============================================================
-- MEDIA ASSETS TABLE
-- ============================================================
create table if not exists public.media_assets (
    id uuid primary key default gen_random_uuid(),
    bucket_id text not null,
    storage_path text not null,
    url text not null,
    alt_text text,
    caption text,
    category text,
    sort_order integer not null default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index if not exists idx_media_assets_category on public.media_assets (category);
create index if not exists idx_media_assets_bucket on public.media_assets (bucket_id);

-- Trigger for updated_at
create or replace trigger trg_media_assets_upd before update on public.media_assets
for each row execute function public.update_timestamp();

-- RLS
alter table public.media_assets enable row level security;

-- Policies
drop policy if exists "public_read_media_assets" on public.media_assets;
create policy "public_read_media_assets"
  on public.media_assets for select using (true);

drop policy if exists "admin_write_media_assets" on public.media_assets;
create policy "admin_write_media_assets"
  on public.media_assets for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage Policies
-- Allow public access to all objects in these buckets
create policy "Public Access"
on storage.objects for select
using ( bucket_id in (
  'hero-assets', 'room-categories', 'physical-room-images', 
  'dining-images', 'experience-images', 'travel-stories', 
  'gallery-images', 'testimonial-assets', 'offers-banners', 
  'dining-menu-assets', 'brand-assets'
));

-- Allow authenticated users to upload/modify objects
create policy "Admin Upload"
on storage.objects for all
using ( auth.role() = 'authenticated' )
with check ( auth.role() = 'authenticated' );
