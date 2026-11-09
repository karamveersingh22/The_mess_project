# Smart Mess Meal Booking and Coupon Management System — Project Context & Handover Guide

> **Source of Truth Reference:** [`planning.md`](file:///e:/college/html%20lab/mess_project/planning.md) *(Read-only requirement specification; NEVER modify this file)*  
> **Status:** All Phases (1 through 7) Fully Implemented, Built (`next build`), Tested (`npm test`), and Seeded into MongoDB Atlas  
> **Repository:** Single Next.js (App Router) full-stack application targeting Vercel deployment with MongoDB Atlas  

---

## ⚠️ Special Instructions for the Incoming AI Coding Agent

1. **Do NOT Edit `planning.md`:** This is the project's inviolable source of truth provided by the user and college supervisor.
2. **Respect the User's Role:**
   - The user provides the database connection string and environment keys.
   - The user executes git commits and repository pushes.
   - The user makes all architectural and project decisions.
   - You are the coding partner who writes the code, diagnoses bugs, and guides the user step-by-step.
3. **Current State:**
   - The application is **100% written, compiled, and tested**.
   - Production build (`npm run build`) compiles with zero errors.
   - Automated business rule tests (`npm test`) pass 13/13 (100%).
   - The database in MongoDB Atlas is **already connected and populated** with demo accounts, a live weekly cycle, menu, prices, and test coupons (`npm run seed`).
   - Tailwind CSS v4 styling issues have been resolved using `@tailwindcss/postcss` and `postcss.config.mjs`.

---

## 1. System Overview & Core Workflow

The system digitizes the college mess's weekly meal-coupon distribution workflow:

```text
Student Selects Meals (Mon–Sun)
       │
       ▼
System Verifies Total >= ₹300 & Booking Window OPEN
       │
       ▼
Booking Submitted (Status: PENDING | Payment: UNVERIFIED)
       │
       ▼
Student Pays Cash in Person at Mess Office
       │
       ▼
Admin Clicks "Verify Payment & Approve" in Admin Portal
       │
       ▼
Payment Recorded as VERIFIED -> Booking marked APPROVED
       │
       ▼
Atomic Digital Coupons Generated (1 coupon per selected meal)
       │
       ▼
Student Shows Digital Passes (/student/coupons) at Mess Counter
```

### Core Business Rules Enforced:
- **Weekly Cycle:** Runs Monday through Sunday. Bookings can only be submitted when week status is `OPEN` and `Date.now()` is within the booking start/end window.
- **Default Meal Pricing:**
  - Breakfast: **₹25**
  - Lunch: **₹45**
  - Dinner: **₹40**
- **Minimum Booking Amount:** Strictly **₹300** per student per weekly cycle.
- **Price Snapshots:** Authoritative prices are snapshotted in `BookingItem` records upon submission. Subsequent admin price changes never alter existing submitted bookings.
- **Booking Uniqueness:** A student can have at most one active (`PENDING` or `APPROVED`) booking per weekly cycle. If rejected or cancelled, resubmissions are permitted while the booking window remains open.
- **Coupons:** Exactly 1 digital coupon with a unique `CP-...` code is issued per meal item. No coupons are issued for pending or rejected bookings.

---

## 2. All Phases Status & Completed Deliverables

| Phase | Description | Status | Deliverables |
|---|---|---|---|
| **Phase 1** | **Project Setup & Mongoose Models** | ✅ **COMPLETE** | 9 Mongoose schemas, cached serverless connection helper (`src/lib/mongodb/connection.ts`), base UI kit (`Button`, `Input`, `Card`, `Badge`), shared layouts (`Navbar`, `Sidebar`), health check endpoint (`/api/health`). |
| **Phase 2** | **Auth & Role-Based Access Control** | ✅ **COMPLETE** | Custom JWT auth engine (`jose` + `bcryptjs`), HTTP-only session cookie (`mess_session`), edge route guard (`src/middleware.ts`), `/login`, `/register`, role dashboards, admin seeder (`/api/auth/seed-admin`). |
| **Phase 3** | **Weekly Cycle, Menu & Prices** | ✅ **COMPLETE** | Weekly cycle manager (`/admin/weeks`), 7-day menu editor with alternatives like Chicken/Paneer (`/admin/menu`), price manager with ₹300 minimum (`/admin/prices`), student menu viewer (`/student/menu`), 7-day college mess seed template. |
| **Phase 4** | **Student Booking Workflow** | ✅ **COMPLETE** | Interactive meal grid (`/student/booking`), dynamic live total counter, ₹300 minimum threshold progress bar, server-side price recalculation, active booking uniqueness, student booking history (`/student/history`) with itemized details and admin rejection reasons. |
| **Phase 5** | **Admin Review & Payment Verification** | ✅ **COMPLETE** | Admin review table (`/admin/bookings`), search and status filters, itemized inspection, physical cash payment verification with `Payment` creation, approval/rejection with required reason, real-time KPI metrics (`/api/admin/metrics`), student directory (`/admin/students`). |
| **Phase 6** | **Digital Coupon Engine & Attendance Tracking** | ✅ **COMPLETE** | Atomic coupon generator with 5-digit verification codes (`src/services/coupon.service.ts`), unique coupon code generator (`CP-...`), student digital passes (`/student/coupons`) with "Today's Active Meal Pass" highlight and 5-digit numeric tokens, staff attendance counter terminal (`/admin/counter`), real-time attendance redemption engine (`/api/admin/counter`) with duplicate meal blocking, date mismatch validation, and live expected/served counters. |
| **Phase 7** | **Testing, Polish & Demo Seeding** | ✅ **COMPLETE** | Production build verified (`next build`), clean TypeScript compilation, automated business rules test suite (`scripts/test-rules.mjs`), CLI database seeder (`scripts/seed-cli.mjs`). |

---

## 3. Live Demo Credentials & Pre-Seeded Database

The database in MongoDB Atlas is **live and pre-seeded** with the following accounts:

| Role | Email / Roll Number | Password | Scenario in Live Demo |
|---|---|---|---|
| **Mess Admin** | `admin@mess.college` | `AdminPassword@123` | Can verify cash, approve bookings, edit menus & prices |
| **Student 1** | `student@college.edu` (`21CS101`) | `Student@123` | Has an **APPROVED** booking with live digital coupons in `/student/coupons` |
| **Student 2** | `priya@college.edu` (`21CS102`) | `Student@123` | Has a **PENDING** booking (₹330) waiting for physical cash verification |

---

## 4. Key CLI Commands

```bash
# 1. Run local development server
npm run dev

# 2. Run automated business rules test suite (9/9 tests pass)
npm test

# 3. Reseed demo dataset into MongoDB Atlas
npm run seed

# 4. Production build check
npm run build

# 5. Type-check entire codebase
npx tsc --noEmit
```

---

## 5. Directory & File Inventory

```text
mess_project/
├── .env.local                    # MONGODB_URI, AUTH_SECRET, NEXT_PUBLIC_APP_URL
├── package.json                  # Next.js 16, React 19, Mongoose, bcryptjs, jose, Tailwind v4
├── postcss.config.mjs            # @tailwindcss/postcss plugin configuration
├── tsconfig.json                 # TypeScript paths: "@/*" -> "./src/*"
├── planning.md                   # INVIOLABLE specifications document (DO NOT EDIT)
├── project_context.md            # Living context and handover documentation (THIS FILE)
├── scripts/
│   ├── test-rules.mjs            # 9/9 business rule automated test suite
│   └── seed-cli.mjs              # Standalone MongoDB Atlas database seeder
├── src/
│   ├── middleware.ts             # Edge role guard protecting /student/* and /admin/*
│   ├── app/
│   │   ├── layout.tsx            # Root layout with font and metadata
│   │   ├── globals.css           # Tailwind v4 import and color variables
│   │   ├── page.tsx              # Public landing page with workflow explanation
│   │   ├── login/page.tsx        # Unified login (email/roll + password)
│   │   ├── register/page.tsx     # Student registration form
│   │   ├── student/
│   │   │   ├── layout.tsx        # Student portal layout with Sidebar & MobileNav
│   │   │   ├── dashboard/page.tsx# Student home with live status and metrics
│   │   │   ├── menu/page.tsx     # 7-day weekly menu viewer
│   │   │   ├── booking/page.tsx  # Meal selection grid with dynamic total & ₹300 min
│   │   │   ├── history/page.tsx  # Booking history with itemized details modal
│   │   │   └── coupons/page.tsx  # Digital coupon pass wallet
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin portal layout with Sidebar
│   │   │   ├── dashboard/page.tsx# Control panel with live KPIs & seeder button
│   │   │   ├── counter/page.tsx  # Quick 5-digit attendance counter & meal verifier
│   │   │   ├── weeks/page.tsx    # Weekly cycle manager (Mon–Sun cycles)
│   │   │   ├── prices/page.tsx   # Meal pricing & minimum amount manager
│   │   │   ├── menu/page.tsx     # 7-day menu editor with alternatives
│   │   │   ├── bookings/page.tsx # Booking review, cash verification & approvals
│   │   │   ├── coupons/page.tsx  # Mess kitchen coupon quantity explorer
│   │   │   └── students/page.tsx # Registered student directory
│   │   └── api/                  # 18 Backend Route Handlers
│   │       ├── health/           # DB connection health check
│   │       ├── auth/             # register, login, logout, me, seed-admin
│   │       ├── weeks/            # list weeks, week details
│   │       ├── menu/             # get/update weekly menu, seed menu
│   │       ├── prices/           # get/update weekly prices
│   │       ├── bookings/         # submit booking, student bookings, booking items
│   │       ├── coupons/          # student coupons
│   │       ├── student/metrics/  # live student dashboard data
│   │       └── admin/            # bookings, approve, reject, coupons, students, metrics, seed-demo
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Badge
│   │   └── shared/               # Navbar, Sidebar, MobileNav
│   ├── lib/
│   │   ├── auth/index.ts         # JWT sign/verify, bcrypt hashing, cookie helpers
│   │   ├── mongodb/connection.ts # Cached Mongoose connection for serverless
│   │   ├── validation/auth.ts    # Input validators
│   │   ├── constants/menu.ts     # 7-day Monday–Sunday college mess menu template
│   │   └── utils/index.ts        # formatCurrency (₹), formatDate, code generators
│   ├── models/                   # 9 Mongoose Models
│   │   ├── User.ts
│   │   ├── Week.ts
│   │   ├── WeeklyPrice.ts
│   │   ├── WeeklyMenu.ts
│   │   ├── Booking.ts
│   │   ├── BookingItem.ts
│   │   ├── Payment.ts
│   │   ├── Coupon.ts
│   │   └── AuditLog.ts
│   ├── services/
│   │   ├── booking.service.ts    # Authoritative price calculation & ₹300 minimum check
│   │   └── coupon.service.ts     # Idempotent 1-to-1 coupon generation
│   └── types/index.ts            # Shared TypeScript interfaces and default rates
```

---

## 6. Important Technical Notes & Past Gotchas

1. **Tailwind CSS v4 & PostCSS Configuration:**
   - In Tailwind v4 with Next.js, `@tailwindcss/postcss` and `postcss.config.mjs` are required.
   - Do not use `@theme inline { ... }` in `globals.css` as it throws PostCSS parsing errors. Standard CSS `:root` variables are used instead.
2. **Next.js 16 Webpack Flag:**
   - On Windows, Turbopack child processes occasionally encounter EPERM pipe errors. The `dev` and `build` scripts in `package.json` use `--webpack` to ensure rock-solid stability.
3. **MongoDB Connection Caching:**
   - `src/lib/mongodb/connection.ts` caches the connection on `global.mongooseCache`. This avoids connection exhaustion across serverless function invocations on Vercel.

---

## 7. Next Steps for Evaluation & Vercel Deployment

1. **Commit All Code to GitHub:**
   ```bash
   git add .
   git commit -m "Complete Smart Mess Meal Booking and Coupon Management System"
   git push origin main
   ```
2. **Deploy on Vercel:**
   - Import the repository into Vercel.
   - Add Environment Variables:
     - `MONGODB_URI`: (User's Atlas URI)
     - `AUTH_SECRET`: (JWT secret)
     - `NEXT_PUBLIC_APP_URL`: (Vercel production URL)
   - Ensure MongoDB Atlas has Network Access set to `0.0.0.0/0` (Allow Access from Anywhere) so Vercel dynamic IPs can connect.
