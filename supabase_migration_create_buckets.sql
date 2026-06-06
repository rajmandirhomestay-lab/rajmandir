-- Create all required storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
('gallery-images', 'gallery-images', true),
('offer-banners', 'offer-banners', true),
('experience-images', 'experience-images', true),
('attraction-images', 'attraction-images', true),
('dining-images', 'dining-images', true),
('dining-menu-assets', 'dining-menu-assets', true),
('travel-stories', 'travel-stories', true),
('room-categories', 'room-categories', true),
('hero-assets', 'hero-assets', true),
('page-heroes', 'page-heroes', true)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS on storage.objects for these buckets so you can upload without auth issues
-- Or just create open policies:
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('gallery-images', 'offer-banners', 'experience-images', 'attraction-images', 'dining-images', 'dining-menu-assets', 'travel-stories', 'room-categories', 'hero-assets', 'page-heroes'));

DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('gallery-images', 'offer-banners', 'experience-images', 'attraction-images', 'dining-images', 'dining-menu-assets', 'travel-stories', 'room-categories', 'hero-assets', 'page-heroes'));

DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
CREATE POLICY "Allow Updates" ON storage.objects FOR UPDATE USING (bucket_id IN ('gallery-images', 'offer-banners', 'experience-images', 'attraction-images', 'dining-images', 'dining-menu-assets', 'travel-stories', 'room-categories', 'hero-assets', 'page-heroes'));

DROP POLICY IF EXISTS "Allow Deletes" ON storage.objects;
CREATE POLICY "Allow Deletes" ON storage.objects FOR DELETE USING (bucket_id IN ('gallery-images', 'offer-banners', 'experience-images', 'attraction-images', 'dining-images', 'dining-menu-assets', 'travel-stories', 'room-categories', 'hero-assets', 'page-heroes'));
