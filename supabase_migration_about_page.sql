-- Create about_page_content table
CREATE TABLE IF NOT EXISTS public.about_page_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key text UNIQUE NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create about_page_features table
CREATE TABLE IF NOT EXISTS public.about_page_features (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create about_page_gallery table
CREATE TABLE IF NOT EXISTS public.about_page_gallery (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies
ALTER TABLE public.about_page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on about_page_content" ON public.about_page_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_page_features" ON public.about_page_features FOR SELECT USING (true);
CREATE POLICY "Allow public read access on about_page_gallery" ON public.about_page_gallery FOR SELECT USING (true);

-- Allow authenticated (admin) write access
CREATE POLICY "Allow admin write access on about_page_content" ON public.about_page_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on about_page_features" ON public.about_page_features FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on about_page_gallery" ON public.about_page_gallery FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial data for about_page_content
INSERT INTO public.about_page_content (section_key, title, subtitle, description, image_url)
VALUES 
('about_raj_mandir', 'About Raj Mandir', 'Where Heritage Meets Hospitality', 'Raj Mandir was raised at the foot of Mehrangarh as a summer residence. Built of locally quarried Jodhpur sandstone, with carved jharokhas by craftsmen from Makrana, it stands as a testament to Marwari heritage.', 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2952&auto=format&fit=crop'),
('the_experience', 'More Than Just a Stay', NULL, 'Experience the royal life with our rooftop dining overlooking the magnificent Mehrangarh Fort. We offer personalized hospitality, ensuring your stay in Jodhpur is comfortable, authentic, and unforgettable.', 'https://images.unsplash.com/photo-1590050752112-9c8e541094cb?q=80&w=2800&auto=format&fit=crop')
ON CONFLICT (section_key) DO NOTHING;

-- Insert initial data for about_page_features
INSERT INTO public.about_page_features (title, description, icon, sort_order)
VALUES 
('Prime Location', 'Situated right at the foot of Mehrangarh Fort with panoramic views.', 'MapPin', 1),
('Authentic Hospitality', 'Warm, personalized service reflecting true Rajasthani culture.', 'Heart', 2),
('Rooftop Dining', 'Enjoy traditional delicacies with an uninterrupted fort view.', 'Utensils', 3),
('Comfortable Rooms', 'Heritage architecture blended seamlessly with modern comfort.', 'BedDouble', 4)
ON CONFLICT DO NOTHING;
