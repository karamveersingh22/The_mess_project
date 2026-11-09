# Smart Mess Meal Booking and Coupon Management System — Project Context & Handover Guide

> **Source of Truth Reference:** [`planning.md`](file:///e:/college/html%20lab/mess_project/planning.md) *(Read-only requirement specification; NEVER modify this file)*  
> **Status:** All Phases (1 through 7) Fully Implemented, Professional UI/UX Overhaul Completed, Light/Dark Theme Active, Built (`next build`), Tested (`npm test`), and Seeded into MongoDB Atlas  
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
   - Production build (`npm run build`) compiles cleanly with 0 errors across all 19 pages and 27 routes.
   - Automated business rule tests (`npm test`) pass 13/13 (100%).
   - The database in MongoDB Atlas is **connected and populated** with demo accounts, a live weekly cycle, menu, prices, and test coupons (`npm run seed`).
   - Professional UI/UX redesign completed with light/dark theme toggle using the requested custom palette (`#0D1E4C`, `#C48CB3`, `#E5C9D7`, `#83A6CE`, `#26415E`, `#0B1B32`).

---

## 1. System Overview & Core Workflow

The system digitizes the college mess's weekly meal-coupon distribution and attendance tracking workflow:

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
with a Unique 5-Digit Counter Verification Code
       │
       ▼
Student tells 5-digit code at mess counter -> Admin enters code in Counter Console
       │
       ▼
Attendance Recorded & Coupon marked REDEEMED
```

### Core Business Rules Enforced:
- **Weekly Cycle:** Runs Monday through Sunday. Bookings can only be submitted when week status is `OPEN` and `Date.now()` is within the booking start/end window.
- **Default Meal Pricing:**
  - Breakfast: **₹25**
  - Lunch: **₹45**
  - Dinner: **₹40**
- **Minimum Booking Amount:** **₹300** mandatory threshold per week. Bookings below this amount are rejected.
- **Physical Cash Verification:** Cash payments are recorded as verified by the admin upon receiving currency at the desk.
- **Atomic 1-to-1 Coupons:** Exactly 1 digital coupon per meal with a unique 5-digit counter verification code.
- **5-Digit Counter Attendance System:** Student tells their 5-digit daily code to mess staff at the physical counter. Admin types it into the live Attendance Tracker console (`/admin/counter`), which verifies the meal type and date, records attendance, and marks the pass as redeemed.
- **Timezone Awareness:** All coupon validity checks and redemptions evaluate dates using Indian Standard Time (`Asia/Kolkata`, UTC+5:30) via `isSameDayInAppTZ()`.

---

## 2. Design System & Theme Architecture

A cohesive, modern UI/UX design was implemented to match the standard of a professional production application:

### Color Palette (from `theme_for_ui_changes.jpg`):
- Deep Navy: `#0D1E4C` (`--brand-navy`)
- Slate Navy: `#26415E` (`--brand-slate`)
- Midnight Navy: `#0B1B32` (`--brand-midnight`)
- Steel Blue: `#83A6CE` (`--brand-blue`)
- Dusty Rose: `#C48CB3` (`--brand-rose`)
- Blush Pink: `#E5C9D7` (`--brand-blush`)

### Theming System:
- **Light/Dark Toggle:** Supported across the entire application via `ThemeToggle.tsx` and standard CSS variables in `globals.css`.
- **Theme Persistence:** Stores user preference in `localStorage('messbook-theme')` with automatic system `prefers-color-scheme` fallback.
- **No FOUC (Flash of Unstyled Content):** Layout features an inline early execution script in `<head>` preventing theme flicker.
- **Component Consistency:** All UI components (`Card`, `Button`, `Input`, `Badge`, `Navbar`, `Sidebar`) and all pages adapt between light and dark modes.

---

## 3. Demo Credentials

The database contains seeded test users:

| Role | Email / Identifier | Password | Access Path |
|------|--------------------|----------|-------------|
| **Mess Admin** | `admin@mess.college` | `AdminPassword@123` | `/admin/dashboard` |
| **Student 1** | `student@college.edu` (Roll: `21CS001`) | `Student@123` | `/student/dashboard` |
| **Student 2** | `priya@college.edu` (Roll: `21CS042`) | `Student@123` | `/student/dashboard` |

---

## 4. Key Project Files

```text
mess_project/
├── src/
│   ├── app/
│   │   ├── globals.css           # Full CSS variables (light & dark)
│   │   ├── layout.tsx            # Root layout with theme-flash prevention script
│   │   ├── page.tsx              # Landing page with hero banner & features
│   │   ├── login/page.tsx        # Split screen auth (brand panel + form)
│   │   ├── register/page.tsx     # Student registration page
│   │   ├── student/
│   │   │   ├── layout.tsx        # Student shell with Navbar & Sidebar
│   │   │   ├── dashboard/page.tsx# Metrics, quick-book banner & guides
│   │   │   ├── booking/page.tsx  # Meal tray builder, day tabs & progress bar
│   │   │   ├── menu/page.tsx     # Weekly menu cards with day filters
│   │   │   ├── coupons/page.tsx  # Boarding-pass digital wallet & 5-digit codes
│   │   │   └── history/page.tsx  # Past bookings & itemized receipt modal
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin shell
│   │   │   ├── dashboard/page.tsx# Operations control center
│   │   │   ├── counter/page.tsx  # 5-digit attendance counter console & live feed
│   │   │   ├── bookings/page.tsx # Cash approvals, search & rejection modal
│   │   │   ├── coupons/page.tsx  # Kitchen quantity registry
│   │   │   ├── weeks/page.tsx    # Cycle scheduling & open/close toggles
│   │   │   ├── prices/page.tsx   # Per-meal prices & ₹300 minimum setting
│   │   │   ├── menu/page.tsx     # 7-day menu editor with dietary options
│   │   │   └── students/page.tsx # Registered student directory
│   │   └── api/                  # 19 Backend Route Handlers
│   ├── components/
│   │   ├── ui/                   # Card, Button, Input, Badge
│   │   └── shared/               # Navbar, Sidebar, ThemeToggle
│   ├── lib/
│   │   ├── auth/index.ts         # JWT sign/verify, bcrypt hashing, cookies
│   │   ├── mongodb/connection.ts # Cached Mongoose connection
│   │   └── utils/index.ts        # IST timezone helpers (isSameDayInAppTZ)
│   └── types/index.ts            # Shared TypeScript interfaces & defaults
```

---

## 5. Verification Commands

1. **Run Unit Tests:**
   ```bash
   npm test
   ```
   *(Executes `scripts/test-rules.mjs` verifying all 13 core business rules)*

2. **Run TypeScript Check:**
   ```bash
   npx tsc --noEmit
   ```
   *(Zero errors)*

3. **Run Production Build:**
   ```bash
   npm run build
   ```
   *(Uses `--webpack` for stability on Windows; compiles 19 pages & 27 endpoints)*

4. **Run Local Dev Server:**
   ```bash
   npm run dev
   ```
   *(Access at `http://localhost:3000`)*
