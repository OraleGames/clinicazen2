# 🏥 ClinicaZen - Modern Medical Therapy Platform

A complete therapy booking and management platform built with Next.js, featuring a beautiful medical theme with blues, cyans, and teals.

## ✨ Features

### 👨‍⚕️ For Therapists
- 📅 **Calendar Management** - Visual weekly grid to set availability
- 🩺 **Service Selection** - Choose therapies to offer and set custom pricing
- ✅ **Appointment Confirmation** - Review and confirm patient bookings
- 📊 **Statistics Dashboard** - Track appointments and revenue
- 🔔 **Real-time Notifications** - Get instant alerts for new bookings

### 👤 For Patients
- 🔍 **Advanced Search** - Filter therapies by symptoms, conditions, price
- 🎥 **Rich Therapy Pages** - Images, videos, testimonials, and detailed info
- 👨‍⚕️ **Therapist Profiles** - View bios, ratings, specialties, and experience
- 📅 **Easy Booking** - Select therapist, pick time slot, and book instantly
- ⭐ **Testimonials** - Read and write therapy reviews

### 🔐 For Admins
- ✅ **Testimonial Moderation** - Approve patient reviews
- 📊 **Full System Access** - Manage all appointments and therapies

---

## 🎨 Design System

**Medical Theme** with professional gradients and modern UI:
- **Blue** (#3B82F6) - Trust, professionalism
- **Cyan** (#06B6D4) - Innovation, freshness
- **Teal** (#14B8A6) - Healing, balance
- **Emerald** (#10B981) - Available, positive

Features:
- 🎨 Gradient cards with depth
- ✨ Smooth hover animations
- 🩺 Medical emoji icons
- 💎 Shadow-based depth
- 📱 Fully responsive

---

## 🚀 Technology Stack

### Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first styling

### UI & Components
- **🧩 shadcn/ui** - Accessible component library
- **🎯 Lucide React** - Beautiful icons
- **🌈 Framer Motion** - Smooth animations

### Database & Auth
- **🗄️ Supabase** - PostgreSQL database with real-time
- **🔐 Supabase Auth** - Authentication with RLS
- **🔒 Row Level Security** - Role-based access control

### State & Forms
- **🎣 React Hook Form** - Form management
- **✅ Zod** - Schema validation
- **🔄 TanStack Query** - Data fetching

---

## 📁 Project Structure

```
clinicazen/
├── database/           # 🗄️ All SQL migration files
│   ├── complete-appointment-system-migration.sql ⭐
│   └── README.md
├── docs/              # � All documentation
│   ├── APPOINTMENT_SYSTEM_DOCUMENTATION.md
│   ├── THERAPY_BROWSING_SYSTEM.md
│   ├── MEDICAL_THEME_STYLING.md
│   ├── QUICK_SETUP_GUIDE.md
│   └── README.md
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── therapist/
│   │   │       ├── calendar/      # 📅 Therapist availability
│   │   │       └── services/      # 🩺 Service management
│   │   ├── terapias/             # 🔍 Therapy browsing
│   │   │   ├── page.tsx          # Therapy list
│   │   │   └── [id]/page.tsx     # Therapy detail
│   │   └── api/                  # 🔌 API routes
│   ├── components/               # 🧩 Reusable components
│   ├── lib/                      # 🛠️ Utilities
│   └── types/                    # 📘 TypeScript types
└── README.md                     # 📖 You are here
```

---

## 🏁 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# In Supabase SQL Editor, run:
database/complete-appointment-system-migration.sql
```

### 3. Configure Environment
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## 📚 Documentation

### Getting Started
- 📖 **[Quick Setup Guide](docs/QUICK_SETUP_GUIDE.md)** - Fast setup instructions
- �️ **[Database README](database/README.md)** - SQL files guide

### System Documentation
- 📅 **[Appointment System](docs/APPOINTMENT_SYSTEM_DOCUMENTATION.md)** - Complete system docs
- 🔍 **[Therapy Browsing](docs/THERAPY_BROWSING_SYSTEM.md)** - Patient-facing features
- 🎨 **[Medical Theme Styling](docs/MEDICAL_THEME_STYLING.md)** - Design system

### All Documentation
- 📚 **[docs/README.md](docs/README.md)** - Complete documentation index

---

## 🗄️ Database Schema

Main tables:
- `appointments` - Patient bookings
- `therapist_availability` - Therapist schedules  
- `therapist_services` - Service offerings
- `testimonials` - Patient reviews
- `notifications` - Real-time alerts
- `payments` - Payment records

See [database/README.md](database/README.md) for details.

---

## 🎯 Why ClinicaZen?

- **🏎️ Complete Solution** - End-to-end booking system out of the box
- **🎨 Beautiful Design** - Medical theme with modern gradients
- **🔒 Secure** - Row Level Security on all tables
- **📱 Responsive** - Works perfectly on all devices
- **🔔 Real-time** - Supabase real-time notifications
- **⚡ Fast** - Optimized performance with proper indexing
- **� Well-Documented** - Comprehensive guides and docs

---
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3020](http://localhost:3020) to see your application running.

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance  
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀
