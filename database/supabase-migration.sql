-- Migration Script to Update Existing Schema
-- Run this in your Supabase SQL dashboard to update from old schema to new one

-- Step 1: Update the user_role enum to replace PATIENT with CLIENT and remove RECEPTIONIST
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT', 'THERAPIST');

-- Step 2: Update the role column to use the new enum
-- First, update existing PATIENT users to CLIENT
UPDATE profiles SET role = 'CLIENT' WHERE role = 'PATIENT';

-- Then, update any RECEPTIONIST users to ADMIN (you may want to handle this differently)
UPDATE profiles SET role = 'ADMIN' WHERE role = 'RECEPTIONIST';

-- Step 3: Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 4: Update appointment_status enum to add new statuses
DROP TYPE IF EXISTS appointment_status CASCADE;
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- Update existing appointments to use new enum (default to PENDING for any that don't match)
UPDATE appointments SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Step 5: Update payment_status enum to add new statuses
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'PARTIAL_REFUND');

-- Update existing payments to use new enum (default to PENDING for any that don't match)
UPDATE payments SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'PAID', 'REFUNDED');

-- Step 6: Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'PENDING';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 5;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Step 7: Create new tables that don't exist

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER')),
    provider TEXT NOT NULL,
    provider_payment_method_id TEXT NOT NULL,
    last_four TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    brand TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id BIGINT REFERENCES appointments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PAYMENT', 'REFUND', 'PARTIAL_REFUND', 'CANCELLATION_FEE')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    provider TEXT NOT NULL,
    provider_transaction_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Calendar integrations table
CREATE TABLE IF NOT EXISTS google_calendar_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    sync_enabled BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapist specific availability table
CREATE TABLE IF NOT EXISTS therapist_specific_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    therapist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(therapist_id, date, start_time)
);

-- Step 8: Add missing columns to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en'));
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Step 9: Add missing columns to therapist_availability table
ALTER TABLE therapist_availability ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE therapist_availability ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE therapist_availability ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 10: Rename services table to therapies (optional, but recommended)
ALTER TABLE services RENAME TO therapies;

-- Step 11: Add missing columns to therapies table
ALTER TABLE therapies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE therapies ADD COLUMN IF NOT EXISTS category TEXT;

-- Step 12: Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appointment ON transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_user ON google_calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_therapies_active ON therapies(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);
CREATE INDEX IF NOT EXISTS idx_therapist_specific_availability_therapist_date ON therapist_specific_availability(therapist_id, date);

-- Step 13: Create triggers for new tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_google_calendar_integrations_updated_at BEFORE UPDATE ON google_calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapist_specific_availability_updated_at BEFORE UPDATE ON therapist_specific_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapies_updated_at BEFORE UPDATE ON therapies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapist_availability_updated_at BEFORE UPDATE ON therapist_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 14: Enable RLS for new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_specific_availability ENABLE ROW LEVEL SECURITY;

-- Step 15: Create RLS policies for new tables

-- Products policies (public read access for active products, admin full access)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (auth.jwt()->>'role' = 'ADMIN');

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment methods" ON payment_methods FOR SELECT USING (auth.jwt()->>'role' = 'ADMIN');

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (auth.jwt()->>'role' = 'ADMIN');

-- Google Calendar integrations policies
CREATE POLICY "Users can manage their own calendar integrations" ON google_calendar_integrations FOR ALL USING (auth.uid() = user_id);

-- Therapist specific availability policies
CREATE POLICY "Therapists can manage their own availability" ON therapist_specific_availability FOR ALL USING (auth.uid() = therapist_id);
CREATE POLICY "Admins can manage all availability" ON therapist_specific_availability FOR ALL USING (auth.jwt()->>'role' = 'ADMIN');
CREATE POLICY "Anyone can view availability" ON therapist_specific_availability FOR SELECT USING (is_available = true);

-- Step 16: Update existing policies to use new role names

-- Drop existing policies that reference old role names
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;

-- Recreate policies with correct role names
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (auth.jwt()->>'role' = 'ADMIN');
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'ADMIN');
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Admins can view all appointments" ON appointments FOR SELECT USING (auth.jwt()->>'role' = 'ADMIN');
CREATE POLICY "Admins can update appointments" ON appointments FOR UPDATE USING (auth.jwt()->>'role' = 'ADMIN');

-- Step 17: Insert default data if tables are empty

-- Insert default categories if they don't exist
INSERT INTO categories (name, description, icon) VALUES 
('Terapias Alternativas', 'Terapias holísticas y complementarias', 'heart'),
('Salud Mental', 'Servicios de psicología y psiquiatría', 'brain'),
('Bienestar', 'Tratamientos de relajación y bienestar', 'sparkles')
ON CONFLICT DO NOTHING;

-- Insert sample therapies if the table is empty
INSERT INTO therapies (name, description, duration_minutes, price, category, is_active) VALUES 
('Reiki', 'Terapia energética japonesa que promueve la relajación y la curación', 60, 50.00, 'Terapias Alternativas', true),
('Acupuntura', 'Medicina tradicional china con inserción de agujas', 45, 65.00, 'Terapias Alternativas', true),
('Psicología Clínica', 'Evaluación y tratamiento de trastornos mentales y emocionales', 50, 80.00, 'Salud Mental', true),
('Hipnosis Terapéutica', 'Técnica para acceder al subconsciente y promover cambios', 60, 70.00, 'Terapias Alternativas', true)
ON CONFLICT DO NOTHING;

-- Step 18: Create a function to increment blog view count
CREATE OR REPLACE FUNCTION increment_blog_view_count(post_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE blog_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_blog_view_count TO authenticated;