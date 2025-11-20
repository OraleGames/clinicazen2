# 📅 Complete Appointment Booking System

## Overview

This is a complete, production-ready appointment booking system for ClinicaZen with:

- ✅ **Therapist Availability Management** - Visual calendar to set weekly availability
- ✅ **Patient Booking Flow** - Browse therapies → Select therapist → Pick time → Book & Pay
- ✅ **Real-time Notifications** - Instant updates for appointments
- ✅ **Payment Integration** - Payment processing ready (Stripe integration placeholder)
- ✅ **Confirmation System** - Therapists confirm appointments
- ✅ **Cancellation System** - Patients can cancel with fee calculation

---

## 🚀 Features

### For Therapists

1. **Availability Calendar** (`/dashboard/therapist/calendar`)
   - Visual weekly calendar (days of week × hours)
   - Toggle cells to mark availability
   - Automatically saves to database
   - Shows upcoming appointments
   - One-click appointment confirmation

2. **Appointment Management**
   - View pending appointments
   - Confirm appointments
   - See appointment details
   - Real-time updates

### For Patients

1. **Browse & Book** (`/terapias` → `/terapias/[id]`)
   - Browse therapies with filters
   - View therapy details
   - See available therapists
   - Check therapist ratings & reviews
   - View real-time availability calendar
   - Select date & time
   - Add notes
   - Book and pay

2. **Appointment Dashboard** (`/dashboard/patient/appointments`)
   - View all appointments
   - Cancel appointments (with fee calculation if <24hrs)
   - See appointment status

### Real-time Notifications

- 🔔 **Notification Bell** in header
- Instant notifications for:
  - New appointment requests (therapists)
  - Appointment confirmations (patients)
  - Appointment cancellations
- Mark as read/delete functionality
- Unread count badge

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── appointments/
│   │   │   ├── book/route.ts          # Create appointment
│   │   │   ├── confirm/route.ts       # Confirm appointment
│   │   │   └── cancel/route.ts        # Cancel appointment
│   │   ├── availability/
│   │   │   ├── route.ts               # Get/Set therapist availability
│   │   │   └── slots/route.ts         # Get available time slots
│   │   └── therapies/
│   │       └── [id]/
│   │           ├── route.ts           # Get therapy details
│   │           └── therapists/route.ts # Get therapists for therapy
│   ├── dashboard/
│   │   ├── therapist/
│   │   │   └── calendar/page.tsx      # Therapist availability calendar
│   │   └── patient/
│   │       └── appointments/page.tsx  # Patient appointments
│   └── terapias/
│       ├── page.tsx                   # Browse therapies
│       └── [id]/page.tsx              # Therapy detail & booking
├── components/
│   └── NotificationBell.tsx           # Real-time notifications
└── lib/
    └── appointments.ts                # Appointment service logic
```

---

## 🗄️ Database Schema

### Key Tables

#### `therapist_availability`
```sql
- therapist_id (UUID)
- day_of_week (0-6, Sunday-Saturday)
- start_time (TIME)
- end_time (TIME)
- is_available (BOOLEAN)
```

#### `appointments`
```sql
- id
- client_id (UUID)
- therapist_id (UUID)
- service_id (BIGINT)
- scheduled_at (TIMESTAMP)
- duration_minutes (INTEGER)
- status (ENUM: PENDING, CONFIRMED, CANCELLED, COMPLETED)
- price (DECIMAL)
- notes (TEXT)
- cancellation_reason (TEXT)
- cancellation_fee (DECIMAL)
- cancelled_at (TIMESTAMP)
```

#### `payments`
```sql
- id
- appointment_id (BIGINT)
- amount (DECIMAL)
- status (ENUM: PENDING, PAID, REFUNDED)
- payment_method (TEXT)
- transaction_id (TEXT)
```

#### `notifications`
```sql
- id
- user_id (UUID)
- title (TEXT)
- message (TEXT)
- type (TEXT)
- read (BOOLEAN)
- data (JSONB)
- created_at (TIMESTAMP)
```

---

## 🔄 Booking Flow

### Patient Side:

1. **Browse Therapies** (`/terapias`)
   - Search and filter therapies
   - Click "Ver Detalles"

2. **View Therapy Details** (`/terapias/[id]`)
   - See therapy info, price, duration
   - View available therapists with ratings

3. **Select Therapist**
   - Click on preferred therapist
   - Moves to time selection

4. **Select Date & Time**
   - Choose date from next 14 days
   - View available time slots (green = available)
   - Select time slot

5. **Confirm & Pay**
   - Review booking summary
   - Add optional notes
   - Click "Confirmar y Pagar"
   - Creates appointment with PENDING status
   - Creates payment record
   - Sends notification to therapist

6. **Wait for Confirmation**
   - Therapist receives notification
   - Appointment shows as PENDING

### Therapist Side:

1. **Receive Notification**
   - Bell icon shows unread count
   - "Nueva Cita Pendiente" notification

2. **View in Calendar** (`/dashboard/therapist/calendar`)
   - Appointment appears in "Próximas Citas"
   - Status: PENDING (yellow badge)

3. **Confirm Appointment**
   - Click "Confirmar" button
   - Status changes to CONFIRMED
   - Patient receives confirmation notification
   - Payment status updates to PAID

---

## 🛠️ Setup Instructions

### 1. Run Database Migration

Execute the SQL migration in Supabase SQL Editor:

```bash
# File: complete-appointment-system-migration.sql
```

This creates all necessary tables, indexes, policies, and triggers.

### 2. Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Seed Sample Data (Optional)

The migration includes sample data insertion for testing. Or manually:

```sql
-- Create a therapist user in Supabase Auth first, then:

INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time, is_available)
VALUES
  ('therapist-uuid', 1, '09:00', '17:00', true), -- Monday
  ('therapist-uuid', 2, '09:00', '17:00', true), -- Tuesday
  -- ... etc
```

### 4. Link Therapists to Services

```sql
INSERT INTO therapist_services (therapist_id, service_id, price)
VALUES
  ('therapist-uuid', 1, 80.00),
  ('therapist-uuid', 2, 100.00);
```

### 5. Test the Flow

1. Create a therapist account
2. Set availability in calendar
3. Create a patient account
4. Browse therapies
5. Book an appointment
6. Therapist confirms
7. Check notifications

---

## 🔐 Security (RLS Policies)

All tables have Row Level Security enabled:

- ✅ Users can only view their own appointments
- ✅ Therapists can manage their own availability
- ✅ Only therapists can confirm their appointments
- ✅ Only clients can book appointments
- ✅ Admins have full access
- ✅ Notifications are user-specific

---

## 💳 Payment Integration

Currently set up for **payment provider integration** (Stripe, PayPal, etc.):

### To Integrate Stripe:

1. Install Stripe SDK:
```bash
npm install stripe @stripe/stripe-js
```

2. Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

3. Update `/api/appointments/book/route.ts`:
```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: service.name },
      unit_amount: price * 100,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/patient/appointments?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/terapias/${service_id}`,
  metadata: { appointment_id: appointment.id }
})

return NextResponse.json({ 
  success: true, 
  paymentUrl: session.url 
})
```

4. Create webhook handler for payment confirmation

---

## 📊 Real-time Features

Using **Supabase Realtime**:

### Notification Subscriptions
```typescript
// Auto-subscribes to notifications table
supabase
  .channel('notifications')
  .on('postgres_changes', { 
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Show new notification
  })
  .subscribe()
```

### Appointment Updates
```typescript
// Real-time appointment status changes
appointmentService.subscribeToAppointments(userId, userRole, (appointment) => {
  // Update UI
})
```

---

## 🎨 UI Components

### Therapist Calendar
- Visual grid: Days × Hours
- Click to toggle availability
- Color-coded: Green (available), White (unavailable)
- Saves to database on change
- Shows upcoming appointments below

### Booking Calendar
- Date selector (next 14 days)
- Time slot grid (hourly)
- Real-time availability check
- Disabled slots for booked times

### Notification Bell
- Badge with unread count
- Dropdown with recent notifications
- Mark as read / Delete
- Real-time updates
- Time formatting (e.g., "Hace 5m")

---

## 🧪 Testing Checklist

- [ ] Therapist can set availability
- [ ] Availability saves to database
- [ ] Patient can browse therapies
- [ ] Patient can see therapists for therapy
- [ ] Patient can view availability calendar
- [ ] Patient can select date & time
- [ ] Patient can book appointment
- [ ] Appointment creates with PENDING status
- [ ] Therapist receives notification
- [ ] Therapist can confirm appointment
- [ ] Status changes to CONFIRMED
- [ ] Patient receives confirmation
- [ ] Patient can cancel appointment
- [ ] Cancellation fee calculated (<24hrs)
- [ ] Notifications show in bell icon
- [ ] Unread count updates
- [ ] Mark as read works
- [ ] Delete notification works

---

## 📈 Future Enhancements

1. **Calendar View**
   - Full monthly calendar view
   - Drag & drop rescheduling

2. **Advanced Scheduling**
   - Recurring appointments
   - Waitlist functionality
   - Buffer time between appointments

3. **Communication**
   - In-app messaging
   - Video call integration
   - Email/SMS reminders

4. **Analytics**
   - Therapist revenue dashboard
   - Patient history tracking
   - Popular therapy insights

5. **Payment Features**
   - Multiple payment methods
   - Subscription packages
   - Refund processing
   - Payment plans

---

## 🐛 Troubleshooting

### Appointments not showing
- Check RLS policies are enabled
- Verify user role is correct
- Check appointment status filter

### Availability not saving
- Verify therapist_id matches logged-in user
- Check database permissions
- Ensure API route is accessible

### Notifications not appearing
- Check Supabase Realtime is enabled
- Verify notifications table exists
- Check RLS policies on notifications

### Time slots not loading
- Verify availability exists for therapist
- Check day_of_week matches
- Ensure scheduled_at is in future

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review SQL migration file
3. Check browser console for errors
4. Verify Supabase connection

---

**Built with ❤️ for ClinicaZen**
