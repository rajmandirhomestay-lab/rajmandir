CREATE TABLE IF NOT EXISTS homepage_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_amenities ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for homepage_amenities"
  ON homepage_amenities FOR SELECT
  TO public
  USING (true);

-- Allow authenticated (admin) full access
CREATE POLICY "Admin full access for homepage_amenities"
  ON homepage_amenities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some default data based on existing frontend hardcoded amenities
INSERT INTO homepage_amenities (icon, label, description, display_order) VALUES
  ('Wifi', 'High-Speed WiFi', 'Stay connected across the palace grounds', 1),
  ('Coffee', 'Heritage Dining', 'Authentic Rajasthani culinary experiences', 2),
  ('Car', 'Airport Transfers', 'Seamless pickup and drop-off service', 3),
  ('Shield', '24/7 Security', 'Complete peace of mind during your stay', 4)
ON CONFLICT DO NOTHING;
