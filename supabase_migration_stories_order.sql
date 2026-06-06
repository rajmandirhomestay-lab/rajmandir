-- Add sort_order column to travel_stories
ALTER TABLE travel_stories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
