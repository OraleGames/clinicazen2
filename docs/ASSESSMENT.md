# Clinica Zen – Current State Assessment (November 15, 2025)

This document is the single source of truth for where the Supabase-backed Next.js 15 app stands **today**, what was completed during the November migration/revival sprint, and what still blocks a full launch. Hand this to any incoming engineer or agent so they can spin up quickly.

---

## 1. Recent Work (Nov 11–15)

| Area | Highlights |
| --- | --- |
| Legacy UI parity | Ported the entire Clinica Zen marketing experience (hero, testimonials, therapist showcase, modal) into the new Next.js 15 root app. |
| Auth UX | Reintroduced `LoginRegisterModal`, restored `LoginForm`, and enhanced `RegisterForm` with a role dropdown (ADMIN/THERAPIST/PATIENT/RECEPTIONIST) so we can mint admin accounts directly. |
| Blog | Hooked the homepage blog section to Supabase via `getBlogPosts`, added a dynamic `/blog/[slug]` route with SEO metadata, and fixed the 404 loop caused by missing pages. |
| UI toolkit | Replaced the placeholder button/input/card components with shadcn-compatible versions to unblock `ServicesShowcase` and dashboard usage. |
| Tooling | `npm install react-icons` + other deps restored parity with the old stack; lint passes and `next build` now succeeds (Windows script still fails at the `cp` step—see §4). |

---

## 2. Repository & Tooling Snapshot

| Area | Status |
| --- | --- |
| Primary frontend | `./` – Next.js 15 App Router, TypeScript, Tailwind 4 (preview), shadcn/ui, React 19. Active code lives here. |
| Legacy mono-repo | `clinicazen2/` – Archived Next 14 + Express/Prisma app. Still referenced for historical UI but **not** serving traffic. Keep until every asset is ported. |
| Package installation | `npm install` (root) succeeds; last run added `react-icons`. Expect peer-warning noise due to Tailwind 4 preview + React 19, but nothing blocking. |
| Dev server | `npm run dev` (delegates to `scripts/dev.mjs`). Requires `.env.local` (see `.env.example`) for Supabase URL/keys; once set, the app boots immediately. |
| Lint | `npm run lint` ✅ — zero errors. |
| Build | `next build` ✅ but the **script** (`npm run build`) terminates on Windows because `cp` is not available. A cross-platform copy step (or `robocopy`/`cpr`) is still TODO. |
| Known warnings | During build, Next emits CSS warnings because global `@import` statements are below other rules. `npm run build` still fails on Windows because of `cp`. |

---

## 3. Supabase Migration Status

| Layer | What exists | Gaps / risks |
| --- | --- | --- |
| Schema & seed | `supabase-schema.sql` & `supabase-seed.sql` cover profiles, services, appointments, chat, payments, notifications, therapist availability, etc. Policies already defined. | No automated migration pipeline; expect to run SQL manually per environment. |
| Client setup | `src/lib/supabase.ts` exports `supabase` + (server-only) `supabaseAdmin`, both now wired to env vars. `.env.example` documents required keys. | No runtime check ensures the service-role key is only used server-side; future hardening could add type-safe wrappers. |
| Auth & roles | `src/lib/auth.ts` + `AuthContext` handle sign-in/up/out, profile fetch, and expose user role. UI now collects role at register-time (incl. ADMIN). | No server components or middleware enforcing role-based routing yet; dashboards are client-side guarded only. |
| Services catalog | `servicesService` fetches categories/symptoms/diseases/services from Supabase, powering `ServicesShowcase` and `/terapias`. | Admin CRUD flows still rely on legacy Prisma API (`clinicazen2/backend`). Need to either port or delete. |
| Appointments | `appointmentsService` implements CRUD, realtime subscriptions, and therapist availability helpers. | No UI or API routes consume these helpers; business policies (overlaps, cancellations, payments) undefined. |
| Chat & notifications | `chatService` ready (rooms/messages/attachments via Supabase channels/storage). Notifications table seeded. | No chat UI, no notification delivery hooks, no presence indicator. |
| Blog | `getBlogPosts` & `getBlogPostBySlug` now read directly from Supabase’s `blog_posts` table and hydrate homepage + `/blog/[slug]`. | No admin/editor UI for publishing; uploads still rely on legacy assets living in `/public/images`. |
| Payments | Database table exists only. | No client/service code, no Stripe/PayPal integration, no webhooks. |
| Legacy backend | `clinicazen2/backend` (Express + Prisma) still ships but is disconnected from the live flow. | Decide whether to retire it or rewrite as Supabase service-layer. Currently a source of confusion. |

---

## 4. Build & Runtime Observations

1. **`next build` succeeds**, but `npm run build` fails on Windows because the final `cp -r` command copies artifacts into `.next/standalone`. Replace it with a cross-platform script (e.g., Node `fs.cp`, `cpr`, or conditional PowerShell copy) before CI.
2. The build logs warn about `@import` ordering in CSS (`globals.css` / component-level styles). Move the Google Font imports to the very top or inline them via `<link>` in `app/layout.tsx`.
3. Supabase credentials now load from `.env.local`; make sure onboarding docs explain how to request keys and never commit personal `.env` files.

---

## 5. Feature Coverage vs Original Plan

| Feature Area | Current state | Still missing |
| --- | --- | --- |
| Marketing site | Legacy hero/testimonial/blog/therapist experiences fully restored with modern shadcn styling. Blog links work end-to-end. | Polish: optimize image hosting, revisit responsive tweaks, move font imports, add analytics. |
| User auth & dashboards | AuthContext + modal flow working; register modal now assigns roles so admins can self-provision. Dashboard routes (`/dashboard`, `/dashboard/[role]`) exist with placeholder content. | Need middleware/route guards, hydrate dashboards with Supabase data, and build admin controls (service/therapist/appointment CRUD). |
| Services discovery | `/terapias` and `ServicesShowcase` pull real Supabase data with filters for categories/symptoms/price. | Service detail pages beyond `/terapias` root, “Add to favorites/book now” flows, and admin editing experiences. |
| Appointments | Service-layer ready (availability CRUD, realtime). | Booking UI, therapist calendar UI, conflict management, payment capture, emails/SMS. |
| Payments | None in code yet. | Choose provider (Stripe vs PayPal), define tables/webhooks, connect to appointment lifecycle. |
| Chat/notifications | Service utilities only. | Build UI (inbox + real-time thread), subscribe to Supabase channels, surface notifications across dashboards. |
| Content/blog | Read-only views backed by Supabase. | Admin/editor UI, image uploads to Supabase storage, drafts, scheduling. |
| Ops/tooling | Lint + build reliable, carousel deps installed, UI kit standardized. | Remove unused Prisma/Express packages, finish `.env` story, document dev scripts, fix Windows build copy. |

---

## 6. Immediate Action Items for Incoming Agent

1. **Environment hygiene**
	- ✅ `.env.example` + `.env.local` pattern landed; update README so onboarding is clear.
	- Decide whether to keep `clinicazen2/` checked in or archive it.

2. **Role-based dashboards**
	- Implement middleware (`middleware.ts`) to redirect users to `/dashboard/[role]` after login and block unauthorized roles.
	- Populate each dashboard with real Supabase queries (appointments for patients, schedule for therapists, admin overview, reception check-ins).

3. **Appointments UI MVP**
	- Build booking wizard (service selection → therapist → slot → confirmation) leveraging `appointmentsService` and Supabase RLS.
	- Add cancellation/reschedule policies + notifications.

4. **Payments decision**
	- Pick Stripe (recommended) and scaffold minimal checkout session tied to appointments. Update schema + add webhook handler under `src/app/api/payments`.

5. **Content management polish**
	- Add blog admin/editor UI (could reuse shadcn forms) + Supabase storage for hero images.
	- Optional: import historical posts from `clinicazen2/frontend` JSON into Supabase.

6. **Build pipeline**
	- Replace the shell `cp` calls in `npm run build` with a Node script for Windows/Linux parity.
	- Fix the CSS `@import` warnings to keep CI clean.

---

## 7. Long-Term Roadmap (after MVP parity)

| Phase | Goals |
| --- | --- |
| Phase 1 – Operational parity | Ship dashboards + appointment booking + payments so the clinic can onboard staff/patients. |
| Phase 2 – Experience upgrades | Real-time chat, notifications, reviews/ratings, therapist availability automation, analytics dashboards. |
| Phase 3 – Integrations | Calendar sync (Google/Outlook), CRM export, marketing automations, multi-clinic support. |

---

### TL;DR for the next agent

- **Run `npm run dev`** (delegates to `scripts/dev.mjs`) to start the app after copying `.env.example` → `.env.local` and pasting the Supabase keys from the infra vault.
- Marketing UI + blog now mirror the legacy site and read from Supabase.
- Authentication works end-to-end with role selection, yet dashboards are stubs.
- Services data, appointments service-layer, and chat utilities already target Supabase tables—your job is to wire real UX + policies on top.
- Payments, notifications, and admin tooling remain greenfield. Start with the items in §6 to keep momentum.
