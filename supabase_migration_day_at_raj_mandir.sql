-- ======================================================
-- DATABASE MIGRATION FOR "A DAY AT RAJ MANDIR" EXPERIENCE
-- ======================================================

-- 1. Create day_at_raj_mandir table
CREATE TABLE IF NOT EXISTS public.day_at_raj_mandir (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  icon VARCHAR(50) DEFAULT 'Sun',
  category VARCHAR(50) DEFAULT 'General',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create day_at_raj_mandir_images table
CREATE TABLE IF NOT EXISTS public.day_at_raj_mandir_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_item_id UUID NOT NULL REFERENCES public.day_at_raj_mandir(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security & Grants
ALTER TABLE public.day_at_raj_mandir ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_at_raj_mandir_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read day_at_raj_mandir" ON public.day_at_raj_mandir;
DROP POLICY IF EXISTS "Allow public write day_at_raj_mandir" ON public.day_at_raj_mandir;
CREATE POLICY "Allow public read day_at_raj_mandir" ON public.day_at_raj_mandir FOR SELECT USING (true);
CREATE POLICY "Allow public write day_at_raj_mandir" ON public.day_at_raj_mandir FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read day_at_raj_mandir_images" ON public.day_at_raj_mandir_images;
DROP POLICY IF EXISTS "Allow public write day_at_raj_mandir_images" ON public.day_at_raj_mandir_images;
CREATE POLICY "Allow public read day_at_raj_mandir_images" ON public.day_at_raj_mandir_images FOR SELECT USING (true);
CREATE POLICY "Allow public write day_at_raj_mandir_images" ON public.day_at_raj_mandir_images FOR ALL USING (true);

GRANT ALL ON public.day_at_raj_mandir TO anon, authenticated, service_role;
GRANT ALL ON public.day_at_raj_mandir_images TO anon, authenticated, service_role;

-- 4. Page Heroes seed entries for 'day-at-raj-mandir' and 'home'
INSERT INTO public.page_heroes (page_slug, eyebrow, title, accent, subtitle, image_url)
VALUES 
('day-at-raj-mandir', 'A DAY AT RAJ MANDIR', 'A Day at', 'Raj Mandir', 'From a peaceful morning to an unforgettable evening.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1920&q=80'),
('home', 'WELCOME TO RAJ MANDIR', 'Where Heritage Meets', 'Hospitality', 'Experience warm hospitality and heritage architecture in the heart of Jodhpur.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80')
ON CONFLICT (page_slug) DO NOTHING;

-- 5. Seed default day activities if table is empty
INSERT INTO public.day_at_raj_mandir (time, title, short_description, full_description, icon, category, sort_order, active)
SELECT * FROM (VALUES
  ('07:30 AM', 'Wake Up & Morning Tea', 'Start the day slowly with a warm cup of tea and peaceful views around Raj Mandir.', 'As dawn gently lights up the desert sky, enjoy a freshly brewed cup of traditional masala chai or herbal tea on your balcony or in our quiet courtyard.', 'Coffee', 'Morning', 1, true),
  ('09:00 AM', 'Traditional Breakfast', 'Enjoy a fresh breakfast before beginning your Jodhpur adventure.', 'Relish a lavish spread featuring authentic Rajasthani breakfast specialties alongside continental favorites, freshly squeezed juices, and local fruits.', 'Utensils', 'Morning', 2, true),
  ('10:30 AM', 'Explore Jodhpur', 'Head out to discover the heritage, culture, streets, and landmarks surrounding the hotel.', 'Step right outside into the historic blue lanes of Navchokiya, or take a short 4-minute walk to Mehrangarh Fort and Jaswant Thada with our walking guide.', 'Compass', 'Afternoon', 3, true),
  ('01:30 PM', 'A Taste of Rajasthan', 'Return to Raj Mandir and enjoy traditional flavours and a relaxed afternoon.', 'Savor a royal Marwari thali or light afternoon refreshments prepared by our heritage culinary team using secret family recipes passed down over generations.', 'Utensils', 'Afternoon', 4, true),
  ('03:00 PM', 'Slow Afternoon', 'Take some time to rest in the comfort of your room or enjoy the peaceful atmosphere of the property.', 'Unwind under carved stone arches, read a book in the shaded courtyards, or rest inside your air-conditioned royal chamber.', 'Moon', 'Afternoon', 5, true),
  ('05:30 PM', 'Golden Hour', 'Watch the evening light transform the Blue City while enjoying the rooftop atmosphere.', 'Gather on our sunset deck as the sun dips below Mehrangarh Fort, casting a magical golden aura across the blue rooftops of Jodhpur.', 'Sun', 'Evening', 6, true),
  ('07:30 PM', 'Rooftop Evening', 'Spend the evening enjoying the ambience, conversations, and views from Raj Mandir.', 'Listen to soft traditional folk music under the stars as lanterns illuminate the rooftop terrace and cold desert breezes roll in.', 'Sparkles', 'Evening', 7, true),
  ('09:00 PM', 'Traditional Dinner', 'End the day with authentic flavours and a warm Rajasthani hospitality experience.', 'Dine in candlelit splendor on curated dishes, fine drinks, and sweet delicacies under the open Jodhpur night sky.', 'Utensils', 'Night', 8, true)
) AS v(time, title, short_description, full_description, icon, category, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.day_at_raj_mandir);
