# 🚀 Quick Setup Guide - Appointment Booking System

## Prerequisites
- ✅ Supabase project created
- ✅ Environment variables configured in `.env.local`
- ✅ npm packages installed

---

## Step-by-Step Setup

### 1️⃣ Run Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `complete-appointment-system-migration.sql`
5. Paste and click **Run**
6. Wait for "Success. No rows returned"

**What this does:**
- Creates all necessary tables (therapist_availability, payments, notifications, etc.)
- Sets up Row Level Security policies
- Creates indexes for performance
- Adds triggers for auto-updating timestamps
- Seeds sample data (optional)

---

### 2️⃣ Create Test Users

#### Create a Therapist Account

1. Go to Supabase **Authentication** → **Users** → **Add user**
2. Enter email: `therapist@test.com`
3. Enter password: `test123456`
4. Click **Create user**
5. Copy the user UUID

6. Go to **SQL Editor** and run:
```sql
-- Update the profile to be a therapist
UPDATE profiles 
SET 
  role = 'THERAPIST',
  name = 'Dr. María García',
  bio = 'Terapeuta especializada en medicina alternativa con 10 años de experiencia'
WHERE email = 'therapist@test.com';
```

#### Create a Patient Account

1. **Authentication** → **Users** → **Add user**
2. Email: `patient@test.com`
3. Password: `test123456`
4. Click **Create user**

5. SQL Editor:
```sql
UPDATE profiles 
SET 
  role = 'PATIENT',
  name = 'Juan Pérez'
WHERE email = 'patient@test.com';
```

---

### 3️⃣ Link Therapist to Services

Find available services:
```sql
SELECT id, name FROM services LIMIT 5;
```

Link therapist to services:
```sql
-- Replace 'therapist-uuid' with the actual UUID from step 2
-- Replace service IDs with actual IDs from your database

INSERT INTO therapist_services (therapist_id, service_id, price)
VALUES
  ('therapist-uuid', 1, 80.00),
  ('therapist-uuid', 2, 100.00),
  ('therapist-uuid', 3, 90.00);
```

---

### 4️⃣ Set Therapist Availability

```sql
-- Monday to Friday, 9 AM to 5 PM
-- Replace 'therapist-uuid' with the actual UUID

INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time, is_available)
VALUES
  ('therapist-uuid', 1, '09:00', '17:00', true), -- Monday
  ('therapist-uuid', 2, '09:00', '17:00', true), -- Tuesday
  ('therapist-uuid', 3, '09:00', '17:00', true), -- Wednesday
  ('therapist-uuid', 4, '09:00', '17:00', true), -- Thursday
  ('therapist-uuid', 5, '09:00', '17:00', true); -- Friday
```

---

### 5️⃣ Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing the Flow

### As Therapist

1. **Login**
   - Go to `http://localhost:3000/login`
   - Email: `therapist@test.com`
   - Password: `test123456`

2. **Set Availability**
   - Click "Entrar" → Go to calendar
   - Or navigate to: `http://localhost:3000/dashboard/therapist/calendar`
   - Click cells to toggle availability (green = available)
   - Click "Guardar Cambios"

3. **View Stats**
   - See today's appointments
   - Check weekly schedule
   - View confirmed appointments
   - See revenue

### As Patient

1. **Login**
   - Go to `http://localhost:3000/login`
   - Email: `patient@test.com`
   - Password: `test123456`

2. **Browse Therapies**
   - Go to `http://localhost:3000/terapias`
   - Browse available therapies
   - Click "Ver Detalles" on any therapy

3. **Book Appointment**
   - Select a therapist
   - Choose a date (next 14 days)
   - Select an available time slot (green)
   - Add optional notes
   - Click "Confirmar y Pagar"
   - See success page with confetti! 🎉

4. **Check Appointments**
   - Go to dashboard: `http://localhost:3000/dashboard/patient/appointments`
   - See pending appointment
   - Can cancel appointment

### Confirm Appointment (Therapist)

1. **Check Notification**
   - Look for bell icon with red badge
   - Click to see "Nueva Cita Pendiente"

2. **Confirm in Calendar**
   - Go to calendar view
   - See appointment in "Próximas Citas"
   - Click "Confirmar" button
   - Status changes to CONFIRMED

3. **Patient Gets Notified**
   - Patient receives "Cita Confirmada" notification
   - Status updates in patient dashboard

---

## 📊 Verify Everything Works

### Check Tables Have Data

```sql
-- Check profiles
SELECT id, name, email, role FROM profiles;

-- Check therapist services
SELECT ts.*, s.name as service_name, p.name as therapist_name
FROM therapist_services ts
JOIN services s ON ts.service_id = s.id
JOIN profiles p ON ts.therapist_id = p.id;

-- Check availability
SELECT ta.*, p.name as therapist_name
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id;

-- Check appointments
SELECT 
  a.id,
  a.scheduled_at,
  a.status,
  c.name as client_name,
  t.name as therapist_name,
  s.name as service_name
FROM appointments a
JOIN profiles c ON a.client_id = c.id
JOIN profiles t ON a.therapist_id = t.id
JOIN services s ON a.service_id = s.id;

-- Check notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

---

## 🔧 Troubleshooting

### Problem: Can't see therapists when booking

**Solution:**
```sql
-- Make sure therapist is linked to services
SELECT * FROM therapist_services WHERE therapist_id = 'your-therapist-uuid';

-- If empty, run the link therapist to services step again
```

### Problem: No time slots available

**Solution:**
```sql
-- Check if availability exists
SELECT * FROM therapist_availability WHERE therapist_id = 'your-therapist-uuid';

-- If empty, set availability (Step 4)
```

### Problem: Can't confirm appointment

**Solution:**
- Make sure you're logged in as the therapist assigned to that appointment
- Check appointment exists: `SELECT * FROM appointments WHERE id = <appointment-id>;`
- Verify API route is accessible

### Problem: Notifications not showing

**Solution:**
1. Check if Supabase Realtime is enabled:
   - Supabase Dashboard → Database → Replication
   - Enable for `notifications` table

2. Check notifications exist:
```sql
SELECT * FROM notifications WHERE user_id = 'your-user-uuid';
```

### Problem: "Row level security policy violation"

**Solution:**
```sql
-- Re-run the RLS policies section from the migration file
-- Or check specific policy:
SELECT * FROM pg_policies WHERE tablename = 'appointments';
```

---

## 🎯 Key URLs

### Patient Flow
- `/terapias` - Browse therapies
- `/terapias/[id]` - Therapy details & booking
- `/booking-success` - Booking confirmation
- `/dashboard/patient/appointments` - View appointments

### Therapist Flow
- `/dashboard/therapist/calendar` - Manage availability & appointments
- `/dashboard/therapist` - Main dashboard

### Admin Flow
- `/dashboard/admin/appointments` - Manage all appointments

---

## 📝 Next Steps

After basic setup works:

1. **Customize Therapies**
   - Add more services in Supabase
   - Upload therapy images
   - Link symptoms and diseases

2. **Integrate Payments**
   - Set up Stripe account
   - Add Stripe keys to `.env.local`
   - Update booking API to use Stripe

3. **Email Notifications**
   - Set up SendGrid or similar
   - Create email templates
   - Send confirmation emails

4. **SMS Reminders**
   - Integrate Twilio
   - Set up automated reminders
   - Send before appointments

---

## ✅ Setup Complete!

You now have a fully functional appointment booking system with:
- ✅ Therapist availability management
- ✅ Patient booking flow
- ✅ Real-time notifications
- ✅ Appointment confirmation/cancellation
- ✅ Beautiful UI with animations

**Happy booking! 🎉**
