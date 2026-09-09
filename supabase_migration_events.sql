-- Migration: Add Events and Event Images Tables for Raj Mandir Hotel

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category TEXT DEFAULT 'Celebration',
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  capacity TEXT,
  starting_price TEXT,
  cta_text TEXT DEFAULT 'Enquire Now',
  cta_link TEXT DEFAULT '/contact',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read access for active events"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Allow public read access for event_images"
  ON public.event_images FOR SELECT USING (true);

-- Admin CRUD policies (assuming anon/authenticated for demo CMS setup)
CREATE POLICY "Allow all access to events for management"
  ON public.events FOR ALL USING (true);

CREATE POLICY "Allow all access to event_images for management"
  ON public.event_images FOR ALL USING (true);

-- Storage bucket creation instructions:
-- Create a public bucket named 'events' in Supabase Storage with public access enabled.
