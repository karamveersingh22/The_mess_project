# Smart Mess Meal Booking and Coupon Management System
## Complete Feature Specification & Video Demonstration Reference Guide

> **Document Purpose:** This document provides an exhaustive, feature-by-feature breakdown of the Smart Mess Meal Booking and Coupon Management System. It is specifically designed to feed into an AI scriptwriting agent to produce a structured, high-impact **10-minute demonstration video script**.
>
> **Project Context:** Built for college messes and student hostels to eliminate paper coupons, prevent attendance fraud, give students flexibility to pick specific meals, and streamline physical cash reconciliation with a 5-digit counter verification gate.

---

## 1. Executive Summary & Problem-Solution Fit

### The Problem in Traditional College Messes:
1. **Paper Coupon Chaos:** Messes print thousands of paper coupon strips weekly. Students lose them, wash them in laundry, or trade fake copies.
2. **Mandatory Block Billing (Financial Injustice):** Students pay for all 21 meals/week even if they go home on weekends or skip breakfast, wasting food and money.
3. **Counter Bottlenecks:** Manual barcode scanners or physical coupon collection slow down queues during peak dining hours.
4. **Kitchen Over/Under-Cooking:** Mess contractors guess how much food to prepare, causing massive food waste or unexpected shortages.
5. **Cash Reconciliation Disputes:** Discrepancies between cash paid at the mess office and coupon slips issued.

### The Solution — Smart Mess Management System:
A modern, responsive full-stack web application combining:
- **Weekly Menu Tray Builder:** Students pick individual breakfasts, lunches, and dinners from a Monday–Sunday schedule with live pricing and a mandatory ₹300 minimum threshold.
- **Physical Cash Office Reconciliation:** Students pay cash at the mess office; the admin verifies receipt and one-click approves the booking.
- **Atomic Digital Passes:** System automatically generates individual passes with meal snapshots and unique **5-digit verification codes**.
- **Live 5-Digit Counter Gate:** Students speak their 5-digit daily code at the counter. The admin types it into the live gate console to record attendance, confirm meal entitlement, and mark the pass as redeemed in real time.
- **Kitchen Capacity Analytics:** Real-time dashboard tallying exact breakfast, lunch, and dinner counts so the kitchen cooks the precise number of plates.

---

## 2. Technical Architecture & Design System

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Database:** MongoDB Atlas via cached Mongoose connection (serverless-ready).
- **Authentication:** Custom JWT-based RBAC (Student & Admin) using `jose` and `bcryptjs` with secure HTTP-only cookies.
- **Styling & Theming:** Tailwind CSS v4 with standard CSS variables.
- **Custom Color Palette (from `theme_for_ui_changes.jpg`):**
  - Deep Navy: `#0D1E4C` (`--brand-navy`)
  - Slate Navy: `#26415E` (`--brand-slate`)
  - Midnight Navy: `#0B1B32` (`--brand-midnight`)
  - Steel Blue: `#83A6CE` (`--brand-blue`)
  - Dusty Rose: `#C48CB3` (`--brand-rose`)
  - Blush Pink: `#E5C9D7` (`--brand-blush`)
- **Theme Switcher:** Instant Sun/Moon toggle with `localStorage` persistence and inline anti-FOUC (Flash of Unstyled Content) execution script in `<head>`.
- **Timezone Integrity:** All meal redemptions, coupon validity dates, and calendar logic enforce **Indian Standard Time (IST, UTC+5:30)** via `isSameDayInAppTZ()`.
- **Automated Test Suite:** 13/13 automated business rule tests covering price calculations, thresholds, unique codes, coupon generation, and anti-fraud protections.

---

## 3. Demo Credentials & Test Personas

| Persona | Role | Email / Identifier | Password | Access Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Mess Manager / Admin** | Admin | `admin@mess.college` | `AdminPassword@123` | `/admin/dashboard` |
| **Aman Sharma (Roll 21CS101)** | Student | `student@college.edu` | `Student@123` | `/student/dashboard` |
| **Priya Patel (Roll 21CS042)** | Student | `priya@college.edu` | `Student@123` | `/student/dashboard` |

---

## 4. Complete Feature-by-Feature Breakdown

### Module 1: Landing Page & Public Experience (`/`)
1. **Hero Section:** High-contrast brand typography, digital badge indicator, tagline: *"Book your weekly meals online, pay at the mess office, and collect your digital coupons. No queues. No paper. Just your phone."*
2. **Three-Step Workflow Showcase:**
   - *01 Browse & Select:* Pick breakfast, lunch, and dinner for each day with live pricing.
   - *02 Pay at the Counter:* Visit the mess office and pay cash in person.
   - *03 Get Digital Coupons:* Instant 5-digit verification codes for counter check-in.
3. **Live Theme Toggle:** Sun/Moon toggle seamlessly switches surfaces and typography between light and dark modes.
4. **Direct Navigation:** Clear CTAs for student registration, student sign-in, and mess admin access.

---

### Module 2: Authentication & Security (`/login`, `/register`, `/api/auth/*`)
1. **Student Registration (`/register`):**
   - Split-screen design: Left decorative branded showcase panel + Right interactive form.
   - Fields: Full Name, College Roll Number (e.g. `21CS101`), College Email, Password, Hostel Room Number, Mobile Number.
   - Validations: Enforces unique email and unique roll number; validates password strength.
2. **Dual-Role Login (`/login`):**
   - Single unified login input accepting **either College Roll Number or Email Address**.
   - Automatic Role-Based Routing: Admins are directed to `/admin/dashboard`; students to `/student/dashboard`.
   - Security: Passwords salted and hashed with `bcryptjs`; sessions signed as JWT tokens inside secure HTTP-only cookies.
3. **Route Protection (Proxy/Middleware):** Unauthorized access to `/student/*` or `/admin/*` routes is intercepted and redirected with return callback parameters.

---

### Module 3: Student Weekly Meal Tray Builder (`/student/booking`)
*This is the core shopping experience for hostel students.*
1. **Cycle Selector Dropdown:** Selects any configured Monday–Sunday operating cycle (displays cycle status: `OPEN` or `CLOSED`).
2. **Day Filter Tabs (Monday–Sunday + Entire Week):**
   - Allows students to focus on one day at a time or browse all 7 days.
   - **Dynamic Badge Counters:** Each day tab features an interactive badge showing exactly how many meals (0 to 3) the student has added for that specific day.
3. **Visual Meal Cards with Color-Coded Accents:**
   - **Breakfast:** Warm Rose accent (`#C48CB3`), morning sunrise icon `🌅`, default rate ₹25.
   - **Lunch:** Steel Blue accent (`#83A6CE`), noon sun icon `☀️`, default rate ₹45.
   - **Dinner:** Slate Navy accent (`#26415E`), evening moon icon `🌙`, default rate ₹40.
   - Displays full dish descriptions (e.g., *Dal Makhani, Steamed Rice, Butter Roti, Gulab Jamun*).
4. **Dietary Alternatives Selector:**
   - If a meal offers choices (e.g., *Butter Chicken* vs. *Paneer Butter Masala*), radio buttons appear upon selection so the student can lock in their dietary preference.
5. **Interactive Selection Controls:**
   - Button states update dynamically: `+ Add to Tray` ➔ `✓ Selected (₹45)`.
   - Card outline illuminates with the meal's accent color upon selection.
6. **Live Cost & Progress Bar (Static Summary Card):**
   - Sits neatly at the top of the booking tray (non-floating to avoid cluttering scrolling).
   - Breakdown counters: Total meals count + individual counts for `B:`, `L:`, and `D:`.
   - **Dynamic Progress Bar:** Visual progress fill bar towards the **₹300 minimum booking threshold**.
   - **Status Badges:** Shows `Add ₹X more to reach ₹300` when below threshold; switches to green `✓ Min Threshold Met` when threshold is reached.
7. **Quick-Select Convenience Shortcuts:**
   - `+ All Lunches`: Instantly selects all 7 lunch meals for the week.
   - `+ All Dinners`: Instantly selects all 7 dinner meals.
   - `+ All Breakfasts`: Instantly selects all 7 breakfast meals.
   - `Clear Selections`: Wipes current tray to start fresh.
8. **Booking Submission:**
   - Generates an immutable booking record with a unique `BK-XXXXX` reference code.
   - Stores an authoritative price snapshot (protecting the student from future price modifications).
   - Sets booking to `PENDING` with payment status `UNVERIFIED`.
   - Displays clear next steps: *"Please visit the mess office to deposit cash."*

---

### Module 4: Student Digital Wallet & Coupon Passes (`/student/coupons`)
1. **Today's Active Passes Highlight Banner (The Counter Hero):**
   - Deep brand gradient banner (`#0D1E4C` to `#26415E`) highlighting meals valid for **TODAY**.
   - Pulsing `Live For Today` status badge.
   - **Prominent 5-Digit Counter Code Display:** Renders the 5-digit verification code in a bold, high-contrast monospace format (`36px+`) so students can read or show it instantly at the counter.
   - Live state indicator: Shows `👉 Tell this code at counter` for active passes; switches to green `✓ Redeemed [Timestamp]` once checked in.
2. **Filter Controls:** Fast filtering between `ALL`, `BREAKFAST`, `LUNCH`, and `DINNER`.
3. **Boarding-Pass Digital Coupon Cards:**
   - Styled like premium digital flight passes with perforated divider lines.
   - Displays: Meal Type, Valid Date, Full Food Snapshot, 5-Digit Counter Code box, System ID (`CP-XXXXX`), and Booking Reference Code.
   - Automatic Greying/Dimming: Redeemed coupons dim with a clear `USED` badge to prevent reuse.

---

### Module 5: Student History & Receipt Itemization (`/student/history`)
1. **Booking History Table:** Lists all past and present bookings with booking code, week date range, total meals, total amount, booking status, and payment status.
2. **Itemized Receipt Breakdown Modal:**
   - Clicking **"Details"** opens a modal showing every single meal chosen, the valid date, dietary option, and the exact price locked at the time of booking.
   - Displays admin rejection reasons if a booking was declined.

---

### Module 6: Student Dashboard Overview (`/student/dashboard`)
1. **Personalized Welcome Banner:** Displays student name, roll number, hostel affiliation, and quick-action buttons (*"🍽️ Book Next Week's Meals"* & *"🎫 View My Passes"* with high-contrast white text).
2. **4 KPI Summary Cards:** Active Booking status, Available Coupons count, Minimum Booking threshold, and Standard Meal Rates.
3. **Active Cycle Notification:** Direct link to browse the active week's menu and launch booking.
4. **Physical Payment & Counter Instructions:** Step-by-step guides for students explaining the cash payment and 5-digit counter check-in workflow.

---

### Module 7: Student Weekly Menu Explorer (`/student/menu`)
1. **Interactive Day Selector:** Switch between Entire Week and individual days.
2. **Dish Cards:** Full menu descriptions, prices, availability indicators, and special dietary choices listed with bullet points.
3. **Header CTA:** Direct button to jump into the booking screen for the open week.

---

### Module 8: Admin Attendance Counter & Gate Console (`/admin/counter`)
*This is the core operational screen used by mess staff during meal hours.*
1. **Session Auto-Detection:** Automatically preselects the active meal session based on the clock:
   - Before 11:00 AM ➔ **BREAKFAST**
   - 11:00 AM – 4:00 PM ➔ **LUNCH**
   - After 4:00 PM ➔ **DINNER**
   - Manual override toggle buttons (`ALL`, `BREAKFAST`, `LUNCH`, `DINNER`).
2. **Live Operational KPI Bar:**
   - **Expected Today:** Total bookings registered for today's meal.
   - **Meals Served:** Total students checked in / plates handed out.
   - **Remaining Plates:** Real-time count of plates left to serve.
3. **5-Digit Keypad & Code Verification Console:**
   - Large monospace input box with automatic numeric sanitization (5 digits maximum).
   - Enter key triggers immediate verification.
   - **Instant Verification Logic:**
     - Checks if the 5-digit code exists in the database.
     - Enforces **Date Matching:** Verifies that the coupon is valid for *TODAY* (using Indian Standard Time). If a student brings tomorrow's code today, it rejects: *"Date Mismatch! This coupon is scheduled for [Date], not today."*
     - Enforces **Status Check:** If the code was already redeemed, it rejects: *"Coupon Already Redeemed! This coupon was checked in at [Time]."*
     - Enforces **Approval Check:** Rejects unapproved or cancelled bookings.
4. **Success Verification Card:**
   - Green banner displaying: Verified Student Name, Roll Number, Meal Type (`LUNCH`), Full Dish Snapshot, Verification Code, and Exact Redemption Timestamp.
5. **Real-Time Check-In Feed:**
   - Bottom table automatically updates after every successful check-in, showing a live stream of roll numbers and served timestamps.

---

### Module 9: Admin Cash Office & Booking Approvals (`/admin/bookings`)
*Used by the mess cashier when students come to deposit physical cash.*
1. **Filter & Search Bar:**
   - Status filters: `ALL`, `PENDING`, `APPROVED`, `REJECTED`.
   - Real-time search by Student Name, Roll Number, or Booking Reference Code.
2. **Bookings Reconciliation Table:** Displays student identity, cycle dates, total amount in cash, total meals, and approval status.
3. **Itemized Inspection Modal:**
   - Cashier clicks **"Items"** to view every meal selected by the student and verify that the cash handed over matches the exact order total.
4. **One-Click Cash Verification & Approval (`✓ Collect & Approve`):**
   - Confirms cash receipt at the counter.
   - Atomically records a `Payment` record (`method: "CASH"`, `status: "VERIFIED"`, `verifiedBy: AdminID`).
   - Marks booking as `APPROVED`.
   - **Atomic Coupon Engine:** Generates exactly 1 coupon per meal, each with an unguessable system ID (`CP-XXXXX`) and an atomic **5-digit verification code** (`10000` to `99999`).
5. **Rejection Modal (`Reject`):**
   - Requires admin to enter a reason (e.g. *"Insufficient cash deposited"*, *"Student requested cancellation"*).
   - Updates status to `REJECTED` and frees the student to book again.

---

### Module 10: Admin Kitchen Quantity Registry (`/admin/coupons`)
*Used by head chefs and grocery managers to plan food quantities.*
1. **Daily & Weekly Plate Breakdown Cards:**
   - Total Coupons Issued.
   - Breakfast Quantity required.
   - Lunch Quantity required.
   - Dinner Quantity required.
2. **Filtered Pass Registry:** Search and filter coupons by week cycle and meal session to view names and 5-digit codes.

---

### Module 11: Admin Weekly Operating Cycles (`/admin/weeks`)
1. **Cycle Calendar Creation (`+ Create New Cycle`):**
   - Start Date (Monday) and End Date (Sunday).
   - Independent Booking Window: Booking Start datetime & Booking End datetime.
   - Initial status: `UPCOMING`, `OPEN`, `CLOSED`.
2. **Automated Provisioning:** Creating a week automatically seeds default prices and default 7-day menus if none exist.
3. **Live Status Toggles:** Admin can toggle `Open Bookings` or `Close Bookings` at any moment.

---

### Module 12: Admin Rates & Thresholds Configuration (`/admin/prices`)
1. **Per-Cycle Price Setting:** Configure custom pricing for Breakfast, Lunch, and Dinner for any specific week.
2. **Minimum Booking Threshold:** Adjust the required minimum cart value (default ₹300).
3. **Historical Price Protection:** Updating prices only affects future bookings; existing submitted bookings retain their locked-in rates.

---

### Module 13: Admin 7-Day Menu Builder (`/admin/menu`)
1. **Full 7-Day Editor:** Expandable Monday-to-Sunday cards.
2. **Meal Controls:**
   - Edit food items and descriptions for Breakfast, Lunch, and Dinner.
   - Toggle meal availability (`Available for booking` checkbox).
   - Add/Remove dietary alternative options (e.g., adding `Egg Curry` alongside `Paneer`).
3. **One-Click Standard Menu Seeder:** Reverts or populates standard college mess dishes instantly with the *"Load Standard Menu"* button.

---

### Module 14: Admin Student Directory (`/admin/students`)
1. **Live Directory Table:** Lists all registered students, roll numbers, emails, registration dates, and lifetime total bookings count.
2. **Instant Search:** Filter student records by typing any part of their name, roll number, or email.

---

### Module 15: Admin Dashboard Overview (`/admin/dashboard`)
1. **Executive Operational Header:** Quick-launch buttons to Attendance Counter, Cash Approvals, and Demo Seeder.
2. **4 Primary KPI Cards:**
   - Pending Cash Approvals (highlighted in red if pending cash exists).
   - Approved Bookings count.
   - Verified Revenue (Total physical cash collected in INR).
   - Total Active Passes issued.
3. **Quick Navigation Cards:** One-click shortcuts to the Attendance Gate, Cash Approvals, Menu Editor, and Pricing.
4. **Quick-Seed Demo Data Button:** Populates a complete working test environment in one click.

---

## 5. End-to-End User Journeys (Video Script Walkthrough)

### Journey 1: The Student Experience (Booking to Coupon)
1. **Registration/Login:** Student logs in with roll number `21CS101` and password `Student@123`.
2. **Tray Selection:** Opens `/student/booking`. Selects Monday Lunch, Tuesday Dinner, Wednesday Lunch & Dinner.
3. **Rule Enforcement:** Shows progress bar at ₹175 / ₹300 (warning badge: *"Add ₹125 more"*).
4. **Meeting Threshold:** Student clicks `+ All Lunches`. Total jumps to ₹315. Progress bar turns green: *"✓ Min Threshold Met"*.
5. **Submission:** Student clicks *Submit Booking*. Receives Booking Reference `BK-XXXXX`.
6. **Physical Payment:** Student visits mess cashier with cash.
7. **Receiving Passes:** Once approved, student opens `/student/coupons` and sees active passes with **5-digit verification codes** ready for dining.

### Journey 2: The Cashier Experience (Cash Collection)
1. **Login:** Admin logs in with `admin@mess.college`.
2. **Open Approvals:** Navigates to `/admin/bookings`. Sees the pending booking for `21CS101`.
3. **Verify Items:** Clicks **"Items"** to review the exact meals and confirms the cash amount matches ₹315.
4. **Approve:** Clicks **"✓ Collect & Approve"**. Status switches to `APPROVED`, and coupons are generated instantly.

### Journey 3: The Dining Counter Gate Experience (Attendance Tracking)
1. **Live Counter:** Admin opens `/admin/counter` on a tablet or desktop at the mess gate.
2. **Student Arrives:** Student gives their 5-digit code (e.g. `84620`).
3. **Entry & Verification:** Admin types `84620` and hits Enter.
4. **Instant Match:** Green success banner displays student name, roll number, meal type, and marks attendance.
5. **Anti-Fraud Proof:** If the student immediately tries to reuse the same code, the system blocks them with *"Coupon Already Redeemed!"*. If the student presents tomorrow's coupon, it blocks them with *"Date Mismatch!"*.

---

## 6. Recommended 10-Minute Video Script Outline

The scriptwriting agent should structure the 10-minute video as follows:

| Timestamp | Segment Title | Key Talking Points & Screens Shown |
| :--- | :--- | :--- |
| **0:00 – 1:15** | **Introduction & Problem Statement** | Discuss mess coupon wastage, lost paper slips, mandatory 21-meal billing injustice, and long counter lines. Introduce MessBook. Show Landing page & Light/Dark theme toggle. |
| **1:15 – 2:30** | **Student Sign-in & Dashboard** | Log in as Student (`21CS101`). Tour Student Dashboard, metrics, and weekly rates. |
| **2:30 – 4:30** | **Interactive Meal Booking & ₹300 Threshold** | Navigate to `/student/booking`. Demonstrate Day tabs, meal accent colors, dietary options (Veg/Non-Veg), live progress bar, and the ₹300 minimum rule. Submit booking. |
| **4:30 – 6:00** | **Cash Office Reconciliation (Admin)** | Switch to Admin portal (`/admin/bookings`). Demonstrate real-time search, the Itemized Receipt modal, and the one-click *"✓ Collect & Approve"* workflow. |
| **6:00 – 7:30** | **Digital Wallet & 5-Digit Counter Pass** | Switch back to Student portal (`/student/coupons`). Showcase the "Today's Active Passes" banner with glowing 5-digit attendance codes and boarding-pass styling. |
| **7:30 – 9:00** | **Live Attendance Gate Counter (Admin)** | Switch to `/admin/counter`. Type the student's 5-digit code. Show instant verification and live feed update. Demonstrate anti-fraud blocks (date mismatch and duplicate redemption). |
| **9:00 – 9:45** | **Admin Management Tools** | Tour Weekly Operating Cycles (`/admin/weeks`), Menu Builder (`/admin/menu`), Pricing (`/admin/prices`), and Kitchen Demand Registry (`/admin/coupons`). |
| **9:45 – 10:00** | **Conclusion & Tech Stack Summary** | Recap benefits: zero paper waste, zero fraud, student meal flexibility, accurate kitchen prep. Mention Next.js 16, TypeScript, Tailwind CSS v4, MongoDB Atlas. |

---

## 7. Verification & Automated Quality Metrics

- **TypeScript Compilation:** 100% clean (`npx tsc --noEmit` exits with code 0).
- **Unit & Business Rule Suite:** 13/13 passing tests (`npm test`):
  - Minimum ₹300 rule enforcement.
  - Unique `BK-` and `CP-` code generation.
  - Monday–Sunday cycle validation.
  - Price snapshot preservation against admin edits.
  - 5-digit verification code generation.
  - Duplicate check-in prevention.
  - Date mismatch anti-fraud block.
- **Production Build:** `npm run build` compiles 19 pages and 27 routes with zero errors.

