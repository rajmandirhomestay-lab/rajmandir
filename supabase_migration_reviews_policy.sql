-- Disable RLS for reviews to fix 403 Forbidden error or add open policies
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled but allow access, you can run:
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "public_all" ON reviews;
-- CREATE POLICY "public_all" ON reviews FOR ALL USING (true) WITH CHECK (true);
