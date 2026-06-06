-- Add num_rooms column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS num_rooms INT NOT NULL DEFAULT 1;
