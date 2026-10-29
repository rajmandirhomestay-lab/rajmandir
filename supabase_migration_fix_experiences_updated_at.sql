-- Fix experiences table trigger by adding the missing updated_at column
ALTER TABLE IF EXISTS experiences ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
