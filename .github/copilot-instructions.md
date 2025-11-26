# 🤖 Copilot Instructions for ClinicaZen

Welcome, AI coding agents! This guide summarizes essential knowledge and conventions for productive work in the ClinicaZen codebase.

## 🏗️ Architecture Overview
- **Monorepo**: All code, SQL, and docs are in a single repo.
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, shadcn/ui)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Docs**: All documentation in `/docs` (see `docs/README.md`)

## 📁 Key Directories
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Reusable React components (UI, dashboard, etc.)
- `src/lib/` — Utilities for API, auth, database, i18n, etc.
- `src/types/` — TypeScript types
- `database/` — All SQL migration/setup scripts (see `database/README.md`)
- `docs/` — System, workflow, and design documentation

## 🛠️ Developer Workflows
- **Install**: `npm install`
- **Dev server**: `npm run dev` (http://localhost:3000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Database setup**: Run `database/complete-appointment-system-migration.sql` in Supabase SQL Editor
- **Environment**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`

## 🧩 Project Patterns & Conventions
- **Component Structure**: Use `/src/components/` for all UI and dashboard elements. Prefer composition and shadcn/ui patterns.
- **API/DB Access**: Use `/src/lib/api.ts`, `/src/lib/database.ts`, and `/src/lib/supabase.ts` for all data access. Avoid direct DB calls in components.
- **Types**: Define and import types from `/src/types/`.
- **Styling**: Tailwind CSS with medical color palette (see `docs/MEDICAL_THEME_STYLING.md`).
- **i18n**: Use Next Intl for translations (see `/src/lib/i18n.ts`).
- **RLS**: All DB tables are protected by Row Level Security. Follow role-based access patterns.

## 🔗 Integration Points
- **Supabase**: Auth, real-time, and DB (see `/src/lib/supabase.ts`)
- **shadcn/ui**: UI primitives (see `/src/components/ui/`)
- **TanStack Query**: Data fetching/caching
- **Zod**: Schema validation
- **Framer Motion**: Animations

## 📚 Reference Examples
- **Therapist dashboard**: `src/app/dashboard/therapist/`
- **Therapy browsing**: `src/app/terapias/`
- **Reusable UI**: `src/components/`
- **Database schema**: `database/complete-appointment-system-migration.sql`

## 🚩 Special Notes
- **Migrations are idempotent**: Safe to re-run main SQL scripts
- **All documentation is in `/docs`**: Start with `docs/README.md` and `docs/QUICK_SETUP_GUIDE.md`
- **Follow existing file and folder naming conventions**


- **UI language requirement**: The application's user-facing text must be Spanish by default. Ensure translations and copy in the codebase are Spanish-first; use Next Intl to manage any additional locales.

---
For more, see the main `README.md` and `/docs` for detailed guides.
