-- ==============================================================================
-- RAJ MANDIR GUEST HOUSE DATABASE UPGRADE
-- Migration for Experiences, Travel Stories, Attractions, and Slider Settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ------------------------------------------------------------------------------
-- 1. EXPERIENCES
-- ------------------------------------------------------------------------------

-- Table: experiences
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Drop NOT NULL constraints from old columns to allow new inserts
DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN subtitle DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;
DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN description DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;
DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN duration DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;
DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN price DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

-- Handle existing rows with null slugs safely before making it NOT NULL and UNIQUE
UPDATE experiences SET slug = encode(gen_random_bytes(6), 'hex') WHERE slug IS NULL;

-- Try to add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiences_slug_key') THEN
        ALTER TABLE experiences ADD CONSTRAINT experiences_slug_key UNIQUE (slug);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    type TEXT,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update_experiences_updated_at
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: experience_images
CREATE TABLE IF NOT EXISTS experience_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TRAVEL STORIES
-- ------------------------------------------------------------------------------

-- Table: travel_stories
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE IF EXISTS travel_stories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

UPDATE travel_stories SET slug = encode(gen_random_bytes(6), 'hex') WHERE slug IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'travel_stories_slug_key') THEN
        ALTER TABLE travel_stories ADD CONSTRAINT travel_stories_slug_key UNIQUE (slug);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS travel_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    featured BOOLEAN DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update_travel_stories_updated_at
DROP TRIGGER IF EXISTS update_travel_stories_updated_at ON travel_stories;
CREATE TRIGGER update_travel_stories_updated_at
    BEFORE UPDATE ON travel_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: travel_story_images
CREATE TABLE IF NOT EXISTS travel_story_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_story_id UUID REFERENCES travel_stories(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ATTRACTIONS
-- ------------------------------------------------------------------------------

-- Table: attractions
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS map_link TEXT;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS attractions ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

UPDATE attractions SET slug = encode(gen_random_bytes(6), 'hex') WHERE slug IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attractions_slug_key') THEN
        ALTER TABLE attractions ADD CONSTRAINT attractions_slug_key UNIQUE (slug);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    location TEXT,
    map_link TEXT,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update_attractions_updated_at
DROP TRIGGER IF EXISTS update_attractions_updated_at ON attractions;
CREATE TRIGGER update_attractions_updated_at
    BEFORE UPDATE ON attractions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: attraction_images
CREATE TABLE IF NOT EXISTS attraction_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. GLOBAL SLIDER SETTINGS
-- ------------------------------------------------------------------------------

-- Table: slider_settings
CREATE TABLE IF NOT EXISTS slider_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL UNIQUE,
    slide_speed INTEGER DEFAULT 3000,
    transition_type TEXT DEFAULT 'slide' CHECK (transition_type IN ('fade', 'slide', 'zoom', 'parallax')),
    autoplay BOOLEAN DEFAULT true,
    pause_on_hover BOOLEAN DEFAULT true,
    show_dots BOOLEAN DEFAULT true,
    show_arrows BOOLEAN DEFAULT true,
    loop BOOLEAN DEFAULT true,
    easing TEXT DEFAULT 'ease-in-out',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update_slider_settings_updated_at
DROP TRIGGER IF EXISTS update_slider_settings_updated_at ON slider_settings;
CREATE TRIGGER update_slider_settings_updated_at
    BEFORE UPDATE ON slider_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------

-- Experiences Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON experiences(slug);
CREATE INDEX IF NOT EXISTS idx_experiences_featured ON experiences(featured);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(active);
CREATE INDEX IF NOT EXISTS idx_experiences_sort_order ON experiences(sort_order);

-- Experience Images Indexes
CREATE INDEX IF NOT EXISTS idx_experience_images_sort_order ON experience_images(sort_order);

-- Travel Stories Indexes
CREATE INDEX IF NOT EXISTS idx_travel_stories_slug ON travel_stories(slug);
CREATE INDEX IF NOT EXISTS idx_travel_stories_featured ON travel_stories(featured);
CREATE INDEX IF NOT EXISTS idx_travel_stories_active ON travel_stories(active);

-- Travel Story Images Indexes
CREATE INDEX IF NOT EXISTS idx_travel_story_images_sort_order ON travel_story_images(sort_order);

-- Attractions Indexes
CREATE INDEX IF NOT EXISTS idx_attractions_slug ON attractions(slug);
CREATE INDEX IF NOT EXISTS idx_attractions_featured ON attractions(featured);
CREATE INDEX IF NOT EXISTS idx_attractions_active ON attractions(active);
CREATE INDEX IF NOT EXISTS idx_attractions_sort_order ON attractions(sort_order);

-- Attraction Images Indexes
CREATE INDEX IF NOT EXISTS idx_attraction_images_sort_order ON attraction_images(sort_order);

-- Slider Settings Indexes
CREATE INDEX IF NOT EXISTS idx_slider_settings_section_name ON slider_settings(section_name);

-- ------------------------------------------------------------------------------
-- 6. RLS (Row Level Security) POLICIES - Public Read, Auth Write
-- ------------------------------------------------------------------------------
-- Enable RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public can read active items, authenticated admins can do all)
CREATE POLICY "Public can view active experiences" ON experiences FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage experiences" ON experiences USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view experience images" ON experience_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage experience images" ON experience_images USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view active travel stories" ON travel_stories FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage travel stories" ON travel_stories USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view travel story images" ON travel_story_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage travel story images" ON travel_story_images USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view active attractions" ON attractions FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage attractions" ON attractions USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view attraction images" ON attraction_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage attraction images" ON attraction_images USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view slider settings" ON slider_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage slider settings" ON slider_settings USING (auth.role() = 'authenticated');
