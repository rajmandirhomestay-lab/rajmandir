-- ==============================================================================
-- RAJ MANDIR GUEST HOUSE DATABASE UPGRADE
-- Migration for Unified Slider Settings & Schema Validation Fixes
-- ==============================================================================

-- 1. Update slider_settings table
ALTER TABLE IF EXISTS slider_settings 
ADD COLUMN IF NOT EXISTS animation_duration INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS mobile_swipe BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS keyboard_navigation BOOLEAN DEFAULT true;

-- Ensure transition_type constraint allows 'crossfade'
DO $$
BEGIN
    ALTER TABLE slider_settings DROP CONSTRAINT IF EXISTS slider_settings_transition_type_check;
    ALTER TABLE slider_settings ADD CONSTRAINT slider_settings_transition_type_check 
        CHECK (transition_type IN ('fade', 'slide', 'zoom', 'parallax', 'crossfade'));
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

-- 2. Fix constraint issues in experiences table
-- We drop NOT NULL constraints for legacy fields that CMS forms no longer supply
DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN price DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN duration DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN subtitle DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

DO $$
BEGIN
    ALTER TABLE IF EXISTS experiences ALTER COLUMN description DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

-- Same for attractions if they had similar constraints
DO $$
BEGIN
    ALTER TABLE IF EXISTS attractions ALTER COLUMN location DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;

DO $$
BEGIN
    ALTER TABLE IF EXISTS attractions ALTER COLUMN map_link DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN END; $$;
