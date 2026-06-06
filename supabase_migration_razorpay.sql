-- 1. Create a function to generate friendly booking numbers (e.g. RMGH-260601-ABCD)
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..4 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN 'RMGH-' || to_char(CURRENT_DATE, 'YYMMDD') || '-' || result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Modify existing bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_number TEXT UNIQUE DEFAULT generate_booking_number(),
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS adults INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS children INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_mattress INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS special_requests TEXT,
  ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- We already have num_rooms, status, total_price, guest_name, guest_email, start_date, end_date.
-- Let's ensure booking_status is strictly typed or defaults safely.
-- Existing 'status' column is typically used for booking_status. Let's rename it to booking_status if it exists, otherwise add it.
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='bookings' and column_name='status')
  THEN
      ALTER TABLE "public"."bookings" RENAME COLUMN "status" TO "booking_status";
  END IF;
END $$;

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'captured', 'failed', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow public to insert payments (for webhook/verify) and select their own (though we don't track user id for guest bookings).
CREATE POLICY "Public insert payments" ON payments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public select payments" ON payments FOR SELECT TO public USING (true);

-- Admin full access to payments
CREATE POLICY "Admin access payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public to update bookings (only for payment status via edge functions technically, but public schema allows it for now)
-- We should have a policy for bookings update.
CREATE POLICY "Public update bookings" ON bookings FOR UPDATE TO public USING (true) WITH CHECK (true);
