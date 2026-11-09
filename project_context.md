# Smart Mess Meal Booking and Coupon Management System — Project Context

> **Source of Truth Reference:** [`planning.md`](file:///e:/college/html%20lab/mess_project/planning.md) *(Read-only specification; do not modify)*  
> **Status:** Phase 1 Complete | Phase 2 Complete | Phase 3 Ready to Begin  
> **Repository:** Single Next.js repository deployed on Vercel with MongoDB Atlas  

---

## 1. System Overview & Core Workflow

The Smart Mess Meal Booking and Coupon Management System is a web application designed to digitize the college mess's weekly meal-coupon distribution workflow.

### Core Business Rules:
1. **Weekly Cycle:** Runs Monday through Sunday. Bookings can only be submitted when the booking window is `OPEN`.
2. **Default Meal Pricing:**
   - Breakfast: **₹25**
   - Lunch: **₹45**
   - Dinner: **₹40**
3. **Minimum Booking Amount:** Strictly **₹300** per student per weekly booking. Submissions below ₹300 are blocked both client-side and server-side.
4. **Authoritative Server Pricing:** Client never calculates authoritative totals. Totals and prices are snapshotted in `BookingItem` records upon submission.
5. **Booking Uniqueness:** A student can have at most one active (`PENDING` or `APPROVED`) booking per weekly cycle. If rejected or cancelled, resubmission is permitted while the booking window remains open.
6. **Physical Payment Flow:** Students pay the mess administration in person (Cash/Physical). No online payment gateway in MVP.
7. **Two-Stage Status Separation:**
   - Booking Status: `PENDING` -> `APPROVED` | `REJECTED` | `CANCELLED`
   - Payment Status: `UNVERIFIED` -> `VERIFIED` | `REJECTED`
8. **Digital Coupon Issuance:** Generated atomically **only after** admin verifies physical payment and approves the booking. Exactly 1 coupon is issued per selected meal item (e.g., 14 meals = 14 coupons).
9. **Role Isolation:**
   - `STUDENT`: Self-registration, view weekly menu, select meals, submit booking (>= ₹300), view own bookings, view own coupons. Cannot access admin APIs or other students' data.
   - `ADMIN`: Manage weekly cycles, configure menus and alternatives, set prices, review booking requests, record physical payments, approve/reject bookings, view all coupons, manage students.

---

## 2. Phased Roadmap Progress Tracker

| Phase | Phase Name | Status | Key Deliverables |
|---|---|---|---|
| **Phase 1** | **Project Setup & Core Foundation** | ✅ **COMPLETE** | Next.js initialized, 9 Mongoose models, cached DB connection, base UI kit (Button, Input, Card, Badge), layout & navigation, `/api/health` endpoint, clean production build verified |
| **Phase 2** | **Authentication & Role-Based Access** | ✅ **COMPLETE** | JWT auth (`lib/auth`), password hashing with `bcryptjs`, register/login/logout/me endpoints, HTTP-only session cookie, route guard middleware, `/login` & `/register` pages, role-based dashboards, `/api/auth/seed-admin` seeder |
| **Phase 3** | **Weekly Cycle, Menu & Pricing** | ⏳ **NEXT** | Week model APIs, menu editor, weekly prices, seed menu for Monday–Sunday, student menu viewer |
| **Phase 4** | **Student Booking Workflow** | ⬜ Pending | Meal selection grid, alternatives selection, dynamic total, server-side price recalculation, ₹300 minimum enforcement, unique active booking check, student booking dashboard & history |
| **Phase 5** | **Admin Verification & Approval** | ⬜ Pending | Admin booking table, search & filters, payment verification dialog, approval/rejection transactions, payment records |
| **Phase 6** | **Digital Coupon Engine** | ⬜ Pending | Idempotent coupon generator (1 coupon per meal item), unique coupon codes, student coupon view, admin coupon reporting |
| **Phase 7** | **Testing, Polish & Deployment** | ⬜ Pending | Business logic validation tests, demo credentials, seed data verification, Vercel deployment guide |

---

## 3. Completed Deliverables Inventory

### Phase 1: Foundation
- **Models (`src/models/`):** `User`, `Week`, `WeeklyPrice`, `WeeklyMenu`, `Booking`, `BookingItem`, `Payment`, `Coupon`, `AuditLog`.
- **Database Helper:** `src/lib/mongodb/connection.ts` (cached connection for serverless).
- **UI Components:** `Button`, `Input`, `Card`, `Badge` in `src/components/ui/`.
- **Shared Components:** `Navbar`, `Sidebar`, `MobileNav` in `src/components/shared/`.
- **Health Check:** `src/app/api/health/route.ts`.
- **Landing Page:** `src/app/page.tsx`.

### Phase 2: Authentication & Roles
- **Auth Engine (`src/lib/auth/index.ts`):**
  - `hashPassword` and `comparePassword` using `bcryptjs`.
  - `signSessionToken` and `verifySessionToken` using `jose` with HS256.
  - `setSessionCookie` and `clearSessionCookie` managing the HTTP-only `mess_session` cookie.
  - `getSessionUser` and `getSessionFromRequest` helpers.
- **Validation (`src/lib/validation/auth.ts`):**
  - Registration validator: enforces full name, uppercase unique roll number, valid email, and minimum 6-character password. Role is strictly forced to `STUDENT`.
  - Login validator: identifier (email or roll number) + password.
- **API Endpoints:**
  - `POST /api/auth/register`: Creates student, logs in via session cookie.
  - `POST /api/auth/login`: Unified student/admin login, sets session cookie, returns redirect destination.
  - `POST /api/auth/logout`: Clears cookie, handles both API fetch and standard form submissions.
  - `GET /api/auth/me`: Returns currently authenticated session user.
  - `POST /api/auth/seed-admin`: Safe endpoint to initialize the default admin account (`admin@mess.college` / `AdminPassword@123`).
- **Route Guard Middleware (`src/middleware.ts`):**
  - Blocks unauthenticated users from `/student/*` and `/admin/*`, redirecting to `/login?callbackUrl=...`.
  - Blocks students from `/admin/*`, redirecting to `/student/dashboard`.
  - Redirects logged-in users away from `/login` and `/register` to their role dashboard.
- **User Interface:**
  - [`/login`](file:///e:/college/html%20lab/mess_project/src/app/login/page.tsx): Sign-in form with error feedback and role-aware redirect.
  - [`/register`](file:///e:/college/html%20lab/mess_project/src/app/register/page.tsx): Student sign-up form with instant login.
  - [`/student/dashboard`](file:///e:/college/html%20lab/mess_project/src/app/student/dashboard/page.tsx): Student home with quick status and links.
  - [`/admin/dashboard`](file:///e:/college/html%20lab/mess_project/src/app/admin/dashboard/page.tsx): Admin control panel with KPI cards and quick links.

---

## 4. Phase Definitions for Remaining Work

### Phase 3: Weekly Booking Cycles, Menu & Pricing
- **Objective:** Enable mess admin to configure weekly cycles, set meal prices, define weekly menus with food item alternatives, and allow students to view the menu.
- **Key Files & Endpoints:**
  - `POST /api/admin/weeks`, `GET /api/weeks`, `PATCH /api/admin/weeks/[weekId]`
  - `GET /api/menu/[weekId]`, `PUT /api/admin/menu/[weekId]`
  - `GET /api/prices/[weekId]`, `PUT /api/admin/prices/[weekId]`
  - Admin Views: `/admin/weeks`, `/admin/menu`, `/admin/prices`
  - Student View: `/student/menu`
  - Seed: Initial 7-day college mess menu and standard prices (₹25, ₹45, ₹40).

### Phase 4: Student Booking Workflow
- **Objective:** Meal selection grid, dynamic total counter, ₹300 minimum threshold enforcement, authoritative server recalculation, and booking history.
- **Key Files & Endpoints:**
  - `POST /api/bookings`: Server validation, price snapshotting, unique active booking check.
  - `GET /api/bookings`: Student's booking history.
  - `GET /api/bookings/[bookingId]`: Itemized booking details.
  - Student Views: `/student/booking`, `/student/history`, `/student/bookings/[bookingId]`

### Phase 5: Admin Booking Verification & Approval
- **Objective:** Booking review table, search/filter, physical payment recording, and approve/reject actions.
- **Key Files & Endpoints:**
  - `GET /api/admin/bookings`: Search by roll number/name, filter by week & status.
  - `POST /api/admin/bookings/[bookingId]/approve`: Verify payment, mark `APPROVED`, trigger coupon generation.
  - `POST /api/admin/bookings/[bookingId]/reject`: Record rejection reason.
  - Admin Views: `/admin/bookings`, `/admin/bookings/[bookingId]`

### Phase 6: Digital Coupon Engine
- **Objective:** Atomic coupon generation (1 coupon per selected meal), unique codes, student coupon wallet, and admin coupon reports.
- **Key Files & Endpoints:**
  - `src/services/coupon.service.ts`: Idempotent coupon generator with duplicate protection.
  - `GET /api/coupons`: Student's own coupons.
  - `GET /api/admin/coupons`: Mess-wide coupon report.
  - Views: `/student/coupons`, `/admin/coupons`

### Phase 7: Testing, Polish & Deployment
- **Objective:** Business rule verification tests, demo accounts, seed data, and Vercel deployment.

---

## 5. What YOU (The User) Need to Do Now

1. **Configure Database Connection:**
   - In [`.env.local`](file:///e:/college/html%20lab/mess_project/.env.local), add your MongoDB Atlas connection string to `MONGODB_URI`.
2. **Commit Phase 2 to Git:**
   ```bash
   git add .
   git commit -m "Phase 2: Authentication, JWT session cookies, route middleware, and role dashboards"
   git push origin main
   ```
3. **Give the Go-Ahead for Phase 3:**
   - Confirm when you are ready to begin **Phase 3 (Weekly Cycle, Menu & Prices Management)**.
