-- 1. Fix missing columns in bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 2. Create Payment Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT,
  upi_id TEXT,
  qr_image_url TEXT,
  payment_instructions TEXT,
  advance_percentage INTEGER DEFAULT 30 CHECK (advance_percentage IN (10, 20, 30, 50, 100)),
  manual_payment_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one row exists for settings
CREATE UNIQUE INDEX IF NOT EXISTS ensure_single_payment_settings_row ON payment_settings ((1));

-- Insert default settings if empty
INSERT INTO payment_settings (account_name, upi_id, payment_instructions, advance_percentage, manual_payment_enabled)
VALUES (
  'Raj Mandir Guest House', 
  'rajmandir@upi', 
  '1. Scan the QR code.
2. Pay the required advance amount.
3. Upload payment screenshot.
4. Enter transaction ID.
5. Wait for booking confirmation.',
  30,
  true
) ON CONFLICT DO NOTHING;

-- 3. Create Manual Payment Submissions Table
CREATE TABLE IF NOT EXISTS manual_payment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  transaction_id TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL,
  screenshot_url TEXT NOT NULL,
  payment_notes TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- RLS for Payment Settings
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for payment_settings" ON payment_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access for payment_settings" ON payment_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS for Manual Payment Submissions
ALTER TABLE manual_payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert manual payments" ON manual_payment_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin full access manual payments" ON manual_payment_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-assets', 'payment-assets', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for payment-proofs (Guests can upload, Admin can do all)
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Admin All Payment Proofs"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-proofs')
WITH CHECK (bucket_id = 'payment-proofs');

-- Storage Policies for payment-assets (Admin only for upload, Public for read)
CREATE POLICY "Public Read Payment Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-assets');

CREATE POLICY "Admin All Payment Assets"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-assets')
WITH CHECK (bucket_id = 'payment-assets');
