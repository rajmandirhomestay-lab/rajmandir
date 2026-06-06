-- ==============================================================================
-- RAJ MANDIR GUEST HOUSE DATABASE UPGRADE
-- Migration for Page Heroes
-- ==============================================================================

-- 1. Create page_heroes table
CREATE TABLE IF NOT EXISTS page_heroes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT UNIQUE NOT NULL,
    eyebrow TEXT,
    title TEXT NOT NULL,
    accent TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS Policies
ALTER TABLE page_heroes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on page_heroes" ON page_heroes
    FOR SELECT USING (true);

-- Allow authenticated (admin) users to insert, update, delete
CREATE POLICY "Allow authenticated full access on page_heroes" ON page_heroes
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. Function to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_page_heroes_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_heroes_modtime
    BEFORE UPDATE ON page_heroes
    FOR EACH ROW
    EXECUTE FUNCTION update_page_heroes_modtime();
