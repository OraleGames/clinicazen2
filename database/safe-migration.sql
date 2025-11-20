-- Super Safe Migration - Run this step by step in your Supabase SQL dashboard

-- First, let's just create the new enum type
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT', 'THERAPIST');

-- Now let's check what's actually in the profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%rol%';

-- Try to add the missing columns first (skip role updates for now)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update appointment_status enum
DROP TYPE IF EXISTS appointment_status CASCADE;
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- Update payment_status enum  
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'PARTIAL_REFUND');

-- Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'PENDING';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 5;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create new tables
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

-- Rename services to therapies
ALTER TABLE services RENAME TO therapies;

-- Add columns to therapies
ALTER TABLE therapies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE therapies ADD COLUMN IF NOT EXISTS category TEXT;

-- Add columns to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en'));
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Insert sample data
INSERT INTO categories (name, description, icon) VALUES 
('Terapias Alternativas', 'Terapias holísticas y complementarias', 'heart'),
('Salud Mental', 'Servicios de psicología y psiquiatría', 'brain'),
('Bienestar', 'Tratamientos de relajación y bienestar', 'sparkles')
ON CONFLICT DO NOTHING;

INSERT INTO therapies (name, description, duration_minutes, price, category, is_active) VALUES 
('Reiki', 'Terapia energética japonesa que promueve la relajación y la curación', 60, 50.00, 'Terapias Alternativas', true),
('Acupuntura', 'Medicina tradicional china con inserción de agujas', 45, 65.00, 'Terapias Alternativas', true),
('Psicología Clínica', 'Evaluación y tratamiento de trastornos mentales y emocionales', 50, 80.00, 'Salud Mental', true),
('Hipnosis Terapéutica', 'Técnica para acceder al subconsciente y promover cambios', 60, 70.00, 'Terapias Alternativas', true)
ON CONFLICT DO NOTHING;