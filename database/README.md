# 🗄️ Database SQL Files

This folder contains all SQL migration and database setup files for ClinicaZen.

---

## 📁 File Organization

### Main Migration Files
- **`complete-appointment-system-migration.sql`** ⭐ - Complete appointment booking system setup (use this!)
  - Creates all tables: appointments, payments, therapist_availability, notifications, testimonials
  - Sets up RLS policies
  - Creates indexes for performance
  - Seeds sample data

### Schema Files
- `supabase-schema.sql` - Original database schema
- `supabase-schema-update.sql` - Schema updates
- `supabase-seed.sql` - Seed data for testing

### Profile Management
- `auto-create-profile-trigger.sql` - Auto-create profile trigger
- `check-and-fix-profiles.sql` - Profile verification and fixes
- `fix-profiles-rls.sql` - Row Level Security for profiles
- `fix-profile-trigger-policy.sql` - Profile trigger policy fixes
- `disable-profile-trigger.sql` - Disable profile trigger
- `re-enable-profile-trigger.sql` - Re-enable profile trigger
- `leave-roles-alone.sql` - Role management
- `reset-profiles-rls.sql` - Reset profile RLS policies

### Frontend Fixes
- `fix-frontend-signup-rls.sql` - Frontend signup RLS fixes
- `fix-blog-images.sql` - Blog image path fixes

### Migration Files
- `supabase-migration.sql` - Original migration
- `supabase-migration-fixed.sql` - Fixed version
- `simple-migration.sql` - Simplified migration
- `safe-migration.sql` - Safe migration with rollback

### Diagnostic
- `diagnostic.sql` - Database diagnostic queries

---

## 🚀 Quick Start

### First Time Setup
1. Open Supabase SQL Editor
2. Run: `complete-appointment-system-migration.sql`
3. Done! ✅

### If You Already Have Tables
The migration uses `CREATE TABLE IF NOT EXISTS` and conditional checks, so it's safe to run multiple times.

---

## 📋 What Gets Created

### Tables
- `appointments` - Patient appointments
- `payments` - Payment records
- `payment_methods` - Saved payment methods
- `therapist_availability` - Therapist calendar
- `therapist_services` - Therapist-therapy relationships
- `notifications` - Real-time notifications
- `testimonials` - Patient reviews

### Views
- `upcoming_appointments` - Convenient view of future appointments

### Indexes
- Performance indexes on all foreign keys
- Composite indexes for common queries

### RLS Policies
- Secure Row Level Security on all tables
- Role-based access (ADMIN, THERAPIST, PATIENT)

---

## 🔧 Common Operations

### Reset RLS Policies
```sql
-- Run: reset-profiles-rls.sql
```

### Check Database Health
```sql
-- Run: diagnostic.sql
```

### Fix Profile Issues
```sql
-- Run: check-and-fix-profiles.sql
```

---

## ⚠️ Important Notes

- Always backup before running migrations
- Test in development first
- `complete-appointment-system-migration.sql` is idempotent (safe to run multiple times)
- Uses conditional checks for table/column existence

---

## 📚 Related Documentation

See `/docs` folder for:
- `APPOINTMENT_SYSTEM_DOCUMENTATION.md` - Full system documentation
- `QUICK_SETUP_GUIDE.md` - Step-by-step setup guide
- `THERAPY_BROWSING_SYSTEM.md` - Therapy browsing docs

---

## 🎯 Recommended Order

1. `complete-appointment-system-migration.sql` - Main setup
2. `supabase-seed.sql` - (Optional) Sample data
3. Done! 🎉
