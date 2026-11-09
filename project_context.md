# Smart Mess Meal Booking and Coupon Management System — Project Context

> **Source of Truth Reference:** [`planning.md`](file:///e:/college/html%20lab/mess_project/planning.md)  
> **Status:** Phase 1 Complete | Phase 2 Ready to Begin  
> **Repository:** Single Next.js repository targeting Vercel deployment with MongoDB Atlas

---

## 1. System Overview & Core Requirements
- **Goal:** Digitize physical mess meal booking and coupon distribution.
- **Workflow:**
  1. Student selects breakfast/lunch/dinner for individual days (Monday–Sunday cycle).
  2. Total must be **₹300 minimum** per weekly booking.
  3. Student submits booking -> status becomes `PENDING`, payment status `UNVERIFIED`.
  4. Student pays in person (physical/cash).
  5. Admin verifies physical payment and approves request -> status `APPROVED`, payment `VERIFIED`.
  6. On approval, digital coupons are generated atomically (1 coupon per selected meal).
  7. If rejected, reason is recorded; student can see rejection reason and resubmit if booking window is open.
- **Roles:**
  - `STUDENT`: Register, login, view weekly menu, book meals (min ₹300), view booking status, view owned coupons.
  - `ADMIN`: Manage weekly booking cycles, manage menu & alternatives, set prices, review requests, verify payment, approve/reject, view coupons and reports.

---

## 2. Tech Stack & Architectural Decisions
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS + custom accessible components
- **Database:** MongoDB Atlas with Mongoose
- **Database Connection:** Cached connection helper (`src/lib/mongodb/connection.ts`) designed specifically for serverless/Vercel environments (connection caching on `global.mongooseCache`).
- **Auth Strategy (Phase 2):** Secure custom JWT auth with `bcryptjs` password hashing and HTTP-only cookies (`jose` / Web Crypto compatible for Edge and Node runtimes). No client-trusted identity.
- **Default Pricing:**
  - Breakfast: ₹25
  - Lunch: ₹45
  - Dinner: ₹40
  - Minimum Weekly Booking Amount: ₹300

---

## 3. Phased Roadmap Progress Tracker

| Phase | Phase Name | Status | Key Deliverables |
|---|---|---|---|
| **Phase 1** | **Project Setup & Core Foundation** | ✅ **COMPLETE** | Next.js initialized, Mongoose models, cached DB connection, base UI kit (Button, Input, Card, Badge), layout & navigation, `/api/health` endpoint, builds verified |
| **Phase 2** | **Authentication & Role-Based Access** | ⏳ **NEXT** | JWT auth (`lib/auth`), password hashing, register/login endpoints, session cookie, route middleware, `/login` & `/register` pages, seed script for admin account |
| **Phase 3** | **Weekly Cycle, Menu & Pricing** | ⬜ Pending | Week model APIs, menu editor, weekly prices, seed menu for Monday–Sunday, student menu viewer |
| **Phase 4** | **Student Booking Workflow** | ⬜ Pending | Meal selection grid, alternatives selection, dynamic total, server-side price recalculation, ₹300 minimum enforcement, unique active booking check, student booking dashboard & history |
| **Phase 5** | **Admin Verification & Approval** | ⬜ Pending | Admin booking table, search & filters, payment verification dialog, approval/rejection transactions, payment records |
| **Phase 6** | **Digital Coupon Engine** | ⬜ Pending | Idempotent coupon generator (1 coupon per meal item), unique coupon codes, student coupon view, admin coupon reporting |
| **Phase 7** | **Testing, Polish & Deployment** | ⬜ Pending | Business logic validation tests, demo credentials, seed data verification, Vercel deployment guide |

---

## 4. Completed in Phase 1 (Detailed Inventory)

### Mongoose Models (`src/models/`):
- [`User.ts`](file:///e:/college/html%20lab/mess_project/src/models/User.ts): User schema with `name`, `rollNumber` (unique), `email` (unique), `passwordHash`, `role` (`STUDENT` | `ADMIN`).
- [`Week.ts`](file:///e:/college/html%20lab/mess_project/src/models/Week.ts): Weekly cycle with `startDate`, `endDate`, `bookingStart`, `bookingEnd`, `status` (`UPCOMING`, `OPEN`, `CLOSED`).
- [`WeeklyPrice.ts`](file:///e:/college/html%20lab/mess_project/src/models/WeeklyPrice.ts): Prices for breakfast, lunch, dinner, and `minimumBookingAmount` (default 300).
- [`WeeklyMenu.ts`](file:///e:/college/html%20lab/mess_project/src/models/WeeklyMenu.ts): Structured 7-day menu with meal options/alternatives and availability toggles.
- [`Booking.ts`](file:///e:/college/html%20lab/mess_project/src/models/Booking.ts): Weekly booking with compound index `{ studentId: 1, weekId: 1 }` allowing only one active (`PENDING` or `APPROVED`) booking per week.
- [`BookingItem.ts`](file:///e:/college/html%20lab/mess_project/src/models/BookingItem.ts): Individual meal item snapshot (`priceAtBooking`, `mealDescriptionSnapshot`, `selectedOption`).
- [`Payment.ts`](file:///e:/college/html%20lab/mess_project/src/models/Payment.ts): Physical payment tracking (`PHYSICAL` / `CASH`), verified timestamp and admin reference.
- [`Coupon.ts`](file:///e:/college/html%20lab/mess_project/src/models/Coupon.ts): Digital coupon with unique code, linked 1-to-1 to each `BookingItem`.
- [`AuditLog.ts`](file:///e:/college/html%20lab/mess_project/src/models/AuditLog.ts): Admin action audit trail.

### Infrastructure & UI (`src/`):
- [`src/lib/mongodb/connection.ts`](file:///e:/college/html%20lab/mess_project/src/lib/mongodb/connection.ts): Cached Mongoose connection helper.
- [`src/lib/utils/index.ts`](file:///e:/college/html%20lab/mess_project/src/lib/utils/index.ts): Date helpers, currency formatter (`₹`), unique code generators.
- [`src/types/index.ts`](file:///e:/college/html%20lab/mess_project/src/types/index.ts): Common TypeScript types and constants.
- [`src/components/ui/`](file:///e:/college/html%20lab/mess_project/src/components/ui/): `Button`, `Input`, `Card`, `Badge` components.
- [`src/components/shared/`](file:///e:/college/html%20lab/mess_project/src/components/shared/): `Navbar`, `Sidebar`, `MobileNav`.
- [`src/app/page.tsx`](file:///e:/college/html%20lab/mess_project/src/app/page.tsx): Responsive landing page explaining the 3-step mess workflow.
- [`src/app/api/health/route.ts`](file:///e:/college/html%20lab/mess_project/src/app/api/health/route.ts): Serverless health check reporting database connection status.
- **Build Verification:** Tested and passed clean production build (`npm run build`).

---

## 5. What YOU (The User) Need to Do Now

1. **Add Your MongoDB Connection String:**
   - Open [`.env.local`](file:///e:/college/html%20lab/mess_project/.env.local).
   - Set `MONGODB_URI` to your MongoDB Atlas connection string:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mess_db?retryWrites=true&w=majority
     ```
2. **Review Environment Settings:**
   - `AUTH_SECRET` is set with a default development secret. Change it if you prefer.
3. **Commit Phase 1 to Git:**
   Run the following commands in your terminal:
   ```bash
   git add .
   git commit -m "Phase 1: Project setup, Mongoose models, shared UI, and MongoDB connection helper"
   git push origin main
   ```
4. **Approve Proceeding to Phase 2:**
   - Once ready, give the go-ahead to start **Phase 2 (Authentication & Roles)**.

