-- Create the room_calendar_prices table for advanced pricing
CREATE TABLE IF NOT EXISTS room_calendar_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES room_categories(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price NUMERIC NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('date', 'range', 'month')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE room_calendar_prices ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read room_calendar_prices"
ON room_calendar_prices FOR SELECT
TO public
USING (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Admin full access room_calendar_prices"
ON room_calendar_prices FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
