# Smart Mess Meal Booking and Coupon Management System

## 1. Project Overview

### 1.1 Project purpose

The Smart Mess Meal Booking and Coupon Management System is a web
application designed to replace the college mess's offline meal-coupon
distribution process with a digital workflow.

At present, students select meals and receive physical coupons from the
mess administration, typically on Saturday and Sunday. The proposed
application will let students select meals for the upcoming week online,
submit a booking request, and receive digital coupons after the mess
admin verifies that the student has paid the required amount physically.

The application will not process online payments in the MVP. The student
will pay the mess admin in person, and the admin will record the payment
verification in the system.

### 1.2 Project goals

-   Allow students to view the weekly mess menu.
-   Allow students to select breakfast, lunch, and dinner for individual
    days.
-   Calculate the total booking amount automatically.
-   Enforce a minimum booking amount of ₹300.
-   Allow students to submit booking requests for admin verification.
-   Allow the mess admin to manage the menu and weekly prices.
-   Allow the mess admin to verify physical payments and approve or
    reject requests.
-   Generate digital meal coupons only after approval.
-   Provide students with booking status, booking history, and coupons.
-   Deploy the application publicly for college project evaluation.

### 1.3 Project scope

The MVP includes:

-   Student registration and login.
-   Admin login and role-based access control.
-   Weekly menu management.
-   Weekly price management.
-   Meal selection and booking.
-   Minimum amount validation.
-   Admin booking review.
-   Physical payment verification.
-   Booking approval and rejection.
-   Digital coupon generation and viewing.
-   Basic booking and coupon reports.
-   Deployment using Vercel and MongoDB Atlas.

The MVP does not require:

-   Online payment gateway integration.
-   Real-time coupon scanning or redemption.
-   SMS notifications.
-   Native Android/iOS applications.
-   Complex mess inventory management.

These can be added as future enhancements.

------------------------------------------------------------------------

## 2. Technology Stack and Architecture

### 2.1 Technology stack

Use the following stack:

-   **Frontend:** Next.js App Router, React, TypeScript.
-   **Styling:** Tailwind CSS.
-   **UI components:** A consistent accessible component library, such
    as shadcn/ui, may be used.
-   **Backend:** Next.js Route Handlers and server-side logic.
-   **Database:** MongoDB Atlas.
-   **Database library:** Mongoose.
-   **Authentication:** Auth.js or a secure custom authentication
    implementation. Select one approach before implementation and use it
    consistently.
-   **Deployment:** Vercel.
-   **Version control:** GitHub.

### 2.2 Why MongoDB Atlas

MongoDB is preferred because the developer is already comfortable with
it. MongoDB Atlas provides a managed cloud database that can be
connected to the Next.js application deployed on Vercel.

The data is naturally document-oriented in several areas, including
weekly menus and meal selections. Mongoose schemas and validation will
help maintain consistency.

### 2.3 Single-repository deployment

The entire application should live in one GitHub repository and be
deployed as one Next.js application on Vercel.

There is no need for a separate Express, FastAPI, or frontend
deployment.

Vercel will host:

-   Next.js pages and UI.
-   Next.js API Route Handlers.
-   Server-side business logic.

MongoDB Atlas will host the persistent database.

### 2.4 High-level architecture

``` text
Student/Admin Browser
        |
        v
     Vercel
        |
        +-- Next.js frontend pages
        |
        +-- Next.js API Route Handlers
                 |
                 v
           MongoDB Atlas
```

### 2.5 Serverless considerations

Vercel uses serverless execution for backend functions. The application
must:

-   Reuse MongoDB connections between invocations where possible.
-   Use a cached connection helper rather than creating a new connection
    for every request.
-   Avoid long-running background processes.
-   Keep API handlers focused on request/response operations.
-   Use database transactions only where supported by the MongoDB
    deployment and correctly configured. For critical approval
    operations, use atomic updates, idempotency checks, and transactions
    where practical.

MongoDB Atlas should be configured to allow connections from the
deployed application. Avoid unrestricted database access where possible;
configure network access and credentials securely.

------------------------------------------------------------------------

## 3. User Roles

There are two primary roles.

### 3.1 Student

Students can:

-   Register and log in.
-   View their dashboard.
-   View the menu for the upcoming week.
-   Select meals.
-   View calculated prices.
-   Submit booking requests.
-   View booking status and history.
-   View coupons after approval.

Students must not be able to:

-   Access admin pages or admin APIs.
-   Change meal prices.
-   Modify menu data.
-   Approve or reject bookings.
-   Access another student's private booking or coupon data.
-   Generate coupons directly.

### 3.2 Mess Admin

The admin can:

-   Log in to the admin dashboard.
-   Create and configure weekly booking cycles.
-   Manage weekly menu items and alternatives.
-   Set weekly breakfast, lunch, and dinner prices.
-   View all booking requests.
-   Search and filter bookings.
-   Review individual booking details.
-   Record physical payment verification.
-   Approve or reject pending bookings.
-   Generate coupons through approval.
-   View coupons and basic reports.
-   View students and their booking records.

Admin accounts must be provisioned securely. Public student registration
must never allow a user to choose the ADMIN role.

------------------------------------------------------------------------

## 4. Core Business Rules

These rules must be implemented in both server-side logic and
appropriate database constraints.

### 4.1 Weekly booking cycle

-   The menu is organized into a weekly cycle.
-   The menu image supplied for the project is Monday through Sunday.
-   **Assumption:** The mess week runs Monday through Sunday.
-   Admin can configure the booking opening and closing times.
-   Students can submit bookings only while the booking window is open.
-   The admin can open or close the booking window.

### 4.2 Meal prices

Default meal prices:

  Meal          Default price
  ----------- ---------------
  Breakfast               ₹25
  Lunch                   ₹45
  Dinner                  ₹40

Prices may be changed by the admin for an upcoming week.

Price changes must not alter existing submitted bookings. Each booking
item must store the price that applied when the booking was submitted.

### 4.3 Minimum booking amount

-   Minimum booking amount: ₹300 per student per weekly booking.
-   Booking amount below ₹300 must be rejected.
-   Booking amount exactly ₹300 is valid.
-   The frontend should display a helpful validation message.
-   The backend must independently validate the minimum amount.
-   The client must never be trusted to submit its own authoritative
    total.

Suggested validation message:

> Your selected meals total ₹250. The minimum booking amount is ₹300.
> Please add more meals to continue.

### 4.4 Booking uniqueness

-   A student may have at most one active booking for a given week.
-   Enforce uniqueness using a MongoDB compound index on student ID and
    week ID.
-   If the booking is rejected or cancelled, define whether the student
    can resubmit. Recommended MVP behavior: allow a new request only if
    the booking window remains open, while preserving the
    rejected/cancelled history.

### 4.5 Booking status

Use these statuses:

-   `PENDING`
-   `APPROVED`
-   `REJECTED`
-   `CANCELLED`

Do not create coupons for pending, rejected, or cancelled bookings.

### 4.6 Payment status

Payment status is separate from booking status:

-   `UNVERIFIED`
-   `VERIFIED`
-   `REJECTED`

A booking being submitted does not mean payment has been received.

### 4.7 Coupon rules

-   Generate coupons only after admin payment verification and booking
    approval.
-   Each selected meal should produce one coupon.
-   Example: 14 selected meals should produce 14 coupons.
-   Each coupon must have a unique identifier/code.
-   Coupons must reference the student, booking, booking item, date, and
    meal type.
-   Approval must be idempotent: repeated approval requests must not
    create duplicate coupons.
-   Coupons cannot be generated directly by students.
-   Coupon validity is limited to the assigned meal date and meal type.

**Assumption:** The MVP will issue one coupon per selected meal. The
coupons can be displayed as individual cards and grouped into a weekly
coupon view.

### 4.8 Menu alternatives

The provided menu includes alternatives such as Chicken/Paneer and
Veg/Egg options.

Recommended behavior:

-   Admin defines alternatives as structured options.
-   Students select one option where the meal requires a choice.
-   The selected option is saved in the booking item.
-   If the admin wants to assign meals without student choice, that can
    be configured later.

This behavior should be confirmed with the mess admin before final
implementation.

### 4.9 Menu and price snapshots

Submitted bookings must not change if the admin edits the menu or prices
later.

When a booking is submitted, store a snapshot of:

-   Meal date.
-   Meal type.
-   Meal description.
-   Selected alternative.
-   Price at booking time.

------------------------------------------------------------------------

## 5. Student Functional Requirements

### 5.1 Registration

The registration page should collect:

-   Full name.
-   College roll number.
-   Email.
-   Password.

Requirements:

-   Roll number must be unique.
-   Email must be unique.
-   Password must be securely hashed if custom authentication is used.
-   Role must default to STUDENT.
-   Validate required fields.
-   Display useful validation errors.

### 5.2 Login and logout

-   Students and admins use the login interface.
-   Successful login redirects users according to their role.
-   Student login redirects to the student dashboard.
-   Admin login redirects to the admin dashboard.
-   Logout invalidates the session.
-   Protected pages must check authentication on the server.

### 5.3 Student dashboard

Display:

-   Student name and roll number.
-   Current/upcoming booking week.
-   Booking status.
-   Selected meal count.
-   Booking amount.
-   Coupon count, if approved.
-   Links to menu, booking, history, and coupons.

### 5.4 Weekly menu

Display a table with:

-   Day.
-   Breakfast.
-   Lunch.
-   Dinner.
-   Meal price.
-   Meal selection control.

The menu should be responsive. On mobile, the table may become
horizontally scrollable or be displayed as day-based cards.

The supplied menu is the initial seed menu. It must be editable by the
admin.

### 5.5 Meal selection

Students can select any available combination of meals for the week.

For every meal selection:

-   Display the meal name.
-   Display its price.
-   Allow selection or deselection.
-   Allow selection of an alternative when configured.
-   Update the total dynamically.

Calculation:

`Total = breakfast count × breakfast price + lunch count × lunch price + dinner count × dinner price`

The server must recalculate the total using database prices.

### 5.6 Booking submission

When the student submits:

1.  Confirm the booking week is open.
2.  Confirm at least one meal is selected.
3.  Verify all selected meal IDs belong to the selected week.
4.  Verify the meals are available.
5.  Recalculate total using authoritative prices.
6.  Verify the total is at least ₹300.
7.  Check that the student has not already submitted a booking for that
    week.
8.  Store booking and booking item records.
9.  Set booking status to `PENDING`.
10. Set payment status to `UNVERIFIED`.
11. Display the booking confirmation and reference ID.

### 5.7 Booking history

Students can view:

-   Week.
-   Booking reference.
-   Number of meals.
-   Total amount.
-   Submission date.
-   Booking status.
-   Payment status.

Students can open a booking to view its full meal list.

### 5.8 Coupons

After approval, students can view:

-   Coupon ID/code.
-   Student name and roll number.
-   Date.
-   Meal type.
-   Selected meal option.
-   Booking reference.
-   Coupon status.

Coupons should be grouped by date or meal type for usability.

------------------------------------------------------------------------

## 6. Admin Functional Requirements

### 6.1 Admin dashboard

Display summary cards:

-   Registered students.
-   Pending booking requests.
-   Approved bookings.
-   Rejected bookings.
-   Total amount verified for the selected week.
-   Coupons generated.

The displayed financial total must include only payments actually marked
verified, not pending requests.

### 6.2 Weekly cycle management

Admin can:

-   Create a week.
-   Set start and end dates.
-   Set booking open time.
-   Set booking close time.
-   Open or close bookings.
-   View previous weeks.

Prevent overlapping weekly cycles unless explicitly supported.

### 6.3 Menu management

Admin can:

-   View the selected week's menu.
-   Edit breakfast, lunch, and dinner for each day.
-   Add food items.
-   Remove food items.
-   Configure alternatives.
-   Mark meals unavailable.
-   Save changes.
-   Preview the menu as a student would see it.

Menu changes apply to the selected week. Submitted bookings retain their
snapshots.

### 6.4 Weekly price management

Admin can set:

-   Breakfast price.
-   Lunch price.
-   Dinner price.
-   Minimum booking amount, defaulting to ₹300.

The pricing page should:

-   Display current prices.
-   Allow changes for a selected week.
-   Validate prices as non-negative amounts.
-   Save who changed the prices and when.
-   Support restoring the default prices.

### 6.5 Booking request management

The admin booking page should show:

-   Student name.
-   Roll number.
-   Week.
-   Meal count.
-   Total amount.
-   Booking status.
-   Payment status.
-   Submission timestamp.

Admin should be able to:

-   Search by name or roll number.
-   Filter by week.
-   Filter by booking status.
-   Open booking details.
-   Review the selected meals and prices.
-   Approve or reject a pending booking.

### 6.6 Payment verification and approval

Admin approval workflow:

1.  Open a pending booking.
2.  Review student identity and booking details.
3.  Confirm the physical payment has been received.
4.  Verify the amount received matches the booking total.
5.  Click **Verify Payment & Approve**.
6.  Server validates the booking is still pending.
7.  Server records payment verification.
8.  Server changes booking status to `APPROVED`.
9.  Server generates coupons.
10. Student sees approved status and coupons.

The system should record:

-   Admin ID.
-   Verified amount.
-   Payment method.
-   Verification timestamp.
-   Booking ID.

Payment method should initially be `PHYSICAL` or `CASH`.

### 6.7 Rejection workflow

Admin can reject a pending booking with a reason.

-   Rejection reason is stored.
-   Student can view the reason.
-   No coupons are generated.
-   Payment should not be marked verified.
-   The booking remains in history.

### 6.8 Coupon administration

Admin can:

-   View coupons for a selected week.
-   Search by student or roll number.
-   Filter by date and meal type.
-   View coupon details.
-   Print or export coupon records if added to MVP.

### 6.9 Student management

Admin can:

-   View registered students.
-   Search students by name or roll number.
-   View student booking history.
-   View coupons associated with a student.

Admin should not see or retrieve students' plaintext passwords.

------------------------------------------------------------------------

## 7. Database Design --- MongoDB Atlas

Use MongoDB Atlas with Mongoose.

The following collections are recommended.

### 7.1 `users`

Fields:

-   `_id`: ObjectId.
-   `name`: string.
-   `rollNumber`: string, unique for students.
-   `email`: string, unique.
-   `passwordHash` or external auth ID.
-   `role`: `STUDENT` or `ADMIN`.
-   `createdAt`.
-   `updatedAt`.

Indexes:

-   Unique email.
-   Unique roll number where applicable.
-   Index on role.

Do not store plaintext passwords.

### 7.2 `weeks`

Fields:

-   `_id`.
-   `startDate`.
-   `endDate`.
-   `bookingStart`.
-   `bookingEnd`.
-   `status`: `UPCOMING`, `OPEN`, `CLOSED`.
-   `createdBy`.
-   `createdAt`.
-   `updatedAt`.

### 7.3 `weeklyPrices`

Fields:

-   `_id`.
-   `weekId`.
-   `breakfastPrice`.
-   `lunchPrice`.
-   `dinnerPrice`.
-   `minimumBookingAmount`, default 300.
-   `updatedBy`.
-   `updatedAt`.

Index:

-   Unique `weekId`.

### 7.4 `weeklyMenus`

A document represents the menu for a week.

Fields:

-   `_id`.
-   `weekId`.
-   `days`: array of day objects.
-   Each day contains:
    -   `date`.
    -   `dayOfWeek`.
    -   `meals`: breakfast, lunch, dinner.
-   Each meal contains:
    -   `mealType`.
    -   `description` or food items.
    -   `options`: structured alternatives.
    -   `isAvailable`.
    -   `price` or price reference.

Use a consistent schema. Do not mix arbitrary text structures across
days.

Index:

-   Unique `weekId`.

### 7.5 `bookings`

Fields:

-   `_id`.
-   `bookingCode`.
-   `studentId`.
-   `weekId`.
-   `totalAmount`.
-   `totalMeals`.
-   `status`.
-   `paymentStatus`.
-   `submittedAt`.
-   `approvedAt`.
-   `approvedBy`.
-   `rejectedAt`.
-   `rejectedBy`.
-   `rejectionReason`.
-   `createdAt`.
-   `updatedAt`.

Indexes:

-   Compound index on `studentId` and `weekId` to prevent duplicate
    weekly bookings.
-   Index on status.
-   Index on week ID.
-   Index on booking code.

If cancelled/rejected resubmissions are supported, carefully design the
uniqueness rule so historical records remain available while only one
active booking exists per student/week.

### 7.6 `bookingItems`

Fields:

-   `_id`.
-   `bookingId`.
-   `studentId`.
-   `weekId`.
-   `date`.
-   `mealType`.
-   `selectedOption`.
-   `mealDescriptionSnapshot`.
-   `priceAtBooking`.
-   `createdAt`.

Indexes:

-   Index on booking ID.
-   Index on student ID and date.
-   Unique booking item constraint for a booking/date/meal type, unless
    the domain explicitly permits multiple meals of the same type.

### 7.7 `payments`

Fields:

-   `_id`.
-   `bookingId`.
-   `studentId`.
-   `amount`.
-   `method`: `PHYSICAL` or `CASH`.
-   `status`: `UNVERIFIED`, `VERIFIED`, `REJECTED`.
-   `verifiedBy`.
-   `verifiedAt`.
-   `notes`.
-   `createdAt`.
-   `updatedAt`.

Indexes:

-   Index on booking ID.
-   Index on status.
-   Prevent multiple verified payment records for the same booking
    unless refunds or partial payments are added later.

### 7.8 `coupons`

Fields:

-   `_id`.
-   `couponCode`.
-   `bookingId`.
-   `bookingItemId`.
-   `studentId`.
-   `weekId`.
-   `date`.
-   `mealType`.
-   `mealDescriptionSnapshot`.
-   `status`: `ACTIVE`, `REDEEMED`, `CANCELLED`.
-   `generatedAt`.

Indexes:

-   Unique coupon code.
-   Unique booking item ID to prevent multiple coupons for the same
    selected meal.
-   Index on student ID and date.
-   Index on week ID and meal type.

### 7.9 `auditLogs` (recommended)

Fields:

-   `_id`.
-   `actorId`.
-   `actorRole`.
-   `action`.
-   `entityType`.
-   `entityId`.
-   `details`.
-   `createdAt`.

Log important admin actions, such as menu changes, price changes,
approvals, rejections, and cancellations.

### 7.10 MongoDB data consistency

MongoDB does not automatically enforce relational integrity. The
implementation must:

-   Validate referenced IDs.
-   Verify ownership before returning student data.
-   Use unique indexes for uniqueness constraints.
-   Use atomic updates for state transitions.
-   Use idempotent approval logic.
-   Use transactions where appropriate and supported by the Atlas
    deployment.
-   Avoid trusting totals, prices, role values, or approval state
    submitted by the client.

------------------------------------------------------------------------

## 8. API Design

Use Next.js Route Handlers under `app/api`.

### 8.1 Authentication

-   `POST /api/auth/register` --- register a student.
-   `POST /api/auth/login` --- authenticate.
-   `POST /api/auth/logout` --- log out.
-   `GET /api/auth/me` --- return current user.

The exact endpoints may vary if Auth.js handles the authentication
routes.

### 8.2 Weeks

-   `GET /api/weeks` --- list available weeks.
-   `GET /api/weeks/[weekId]` --- fetch week details.
-   `POST /api/admin/weeks` --- create a week.
-   `PATCH /api/admin/weeks/[weekId]` --- update booking window or
    status.

### 8.3 Menu

-   `GET /api/menu/[weekId]` --- fetch weekly menu.
-   `PUT /api/admin/menu/[weekId]` --- update weekly menu.

### 8.4 Prices

-   `GET /api/prices/[weekId]` --- fetch weekly prices.
-   `PUT /api/admin/prices/[weekId]` --- update weekly prices.

### 8.5 Bookings

-   `POST /api/bookings` --- submit a booking.
-   `GET /api/bookings` --- get the authenticated student's bookings.
-   `GET /api/bookings/[bookingId]` --- get booking details, subject to
    authorization.
-   `GET /api/admin/bookings` --- list bookings for admin.
-   `POST /api/admin/bookings/[bookingId]/approve` --- verify payment
    and approve.
-   `POST /api/admin/bookings/[bookingId]/reject` --- reject booking.

### 8.6 Coupons

-   `GET /api/coupons` --- get the authenticated student's coupons.
-   `GET /api/coupons/[couponId]` --- view a coupon owned by the
    student.
-   `GET /api/admin/coupons` --- admin coupon listing.

Every endpoint must validate authentication, authorization, input data,
and business rules.

------------------------------------------------------------------------

## 9. Frontend Pages and Navigation

### 9.1 Public pages

-   `/login`
-   `/register`

### 9.2 Student pages

-   `/student/dashboard`
-   `/student/menu`
-   `/student/booking`
-   `/student/bookings`
-   `/student/bookings/[bookingId]`
-   `/student/coupons`
-   `/student/history`

### 9.3 Admin pages

-   `/admin/dashboard`
-   `/admin/weeks`
-   `/admin/menu`
-   `/admin/prices`
-   `/admin/bookings`
-   `/admin/bookings/[bookingId]`
-   `/admin/coupons`
-   `/admin/students`
-   `/admin/reports`

### 9.4 UI design direction

Use a clean college-portal style:

-   Light background.
-   Dark blue primary color.
-   Green for approved.
-   Amber/yellow for pending.
-   Red for rejected.
-   Responsive layouts.
-   Clear status badges.
-   Tables for desktop and responsive cards or horizontal scrolling on
    mobile.
-   Student navigation should be simple.
-   Admin navigation should use a sidebar.

Prioritize readability, consistency, and usability over decorative
animation.

------------------------------------------------------------------------

## 10. Security and Authorization

Security is a project requirement, not an optional UI feature.

-   Protect all student and admin pages.
-   Verify roles on the server for every privileged operation.
-   Students can access only their own bookings and coupons.
-   Admin APIs must require the ADMIN role.
-   Never trust client-provided user IDs for ownership.
-   Never trust client-provided booking totals or prices.
-   Never allow students to change their role.
-   Hash passwords securely if passwords are managed by the application.
-   Use secure session cookies or a trusted authentication library.
-   Validate and sanitize user input.
-   Keep database credentials in environment variables.
-   Do not commit `.env` files.
-   Use a least-privilege database account.
-   Avoid exposing secrets through `NEXT_PUBLIC_` environment variables.
-   Handle errors without revealing credentials or internal stack
    traces.

------------------------------------------------------------------------

## 11. Deployment Plan

### 11.1 MongoDB Atlas setup

1.  Create a MongoDB Atlas project.
2.  Create a cluster.
3.  Create a database user with a strong password.
4.  Configure network access for the deployment.
5.  Obtain the MongoDB connection string.
6.  Configure the application to use the connection string.
7.  Test connectivity from local development.
8.  Test connectivity from Vercel after deployment.

### 11.2 GitHub setup

1.  Create a GitHub repository.
2.  Initialize the Next.js project.
3.  Commit the initial structure.
4.  Add `.env.example`.
5.  Ensure `.env` is ignored by Git.
6.  Push code to GitHub.

### 11.3 Vercel setup

1.  Sign in to Vercel.
2.  Import the GitHub repository.
3.  Configure environment variables.
4.  Deploy the application.
5.  Verify build logs.
6.  Test the public URL.
7.  Push subsequent changes to GitHub to trigger deployments.

### 11.4 Environment variables

Example:

``` env
MONGODB_URI=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
```

Additional variables may be required depending on the authentication
implementation.

Never commit actual secrets.

### 11.5 Demo readiness

Before showing the application to the teacher:

-   Create an admin account.
-   Create several student demo accounts.
-   Seed the weekly menu.
-   Configure weekly prices.
-   Create a booking cycle.
-   Test a pending booking.
-   Test approval and coupon generation.
-   Ensure the public URL is working.
-   Prepare demo credentials securely for the evaluation.

Do not rely on local-only data for the demonstration.

------------------------------------------------------------------------

## 12. Testing Plan

### 12.1 Booking tests

-   Booking below ₹300 is rejected.
-   Booking of exactly ₹300 is accepted.
-   Booking above ₹300 is accepted.
-   Empty booking is rejected.
-   Booking outside the window is rejected.
-   Duplicate weekly booking is rejected.
-   Unavailable meals cannot be selected.
-   Client-supplied incorrect totals are ignored.
-   Existing booking prices remain unchanged after admin price edits.

### 12.2 Admin tests

-   Student cannot access admin pages.
-   Student cannot call admin APIs.
-   Admin can update menu.
-   Admin can update prices.
-   Admin can view pending requests.
-   Admin can approve a valid pending booking.
-   Admin cannot approve an already approved booking.
-   Admin can reject a pending booking.
-   Rejection reason is visible to the student.

### 12.3 Coupon tests

-   Pending booking has no coupons.
-   Rejected booking has no coupons.
-   Approved booking generates one coupon per selected meal.
-   Repeated approval does not create duplicate coupons.
-   Coupon belongs to the correct student.
-   Coupon date and meal type match the booking item.
-   Students cannot access other students' coupons.

### 12.4 Deployment tests

-   Login works on deployed URL.
-   Database reads and writes work on deployed URL.
-   Student pages load.
-   Admin pages load for admin users.
-   API routes work in the Vercel environment.
-   No secrets are exposed.
-   Mobile layout is usable.

------------------------------------------------------------------------

## 13. Development Roadmap

Implement the project in controlled phases. Do not ask a coding agent to
generate the entire application in one prompt.

### Phase 1 --- Project setup

-   Create Next.js App Router project.
-   Configure TypeScript and Tailwind.
-   Create GitHub repository.
-   Configure MongoDB Atlas.
-   Install and configure Mongoose.
-   Implement reusable MongoDB connection helper.
-   Create shared layout and UI components.

**Acceptance criteria:** Application runs locally and connects to
MongoDB Atlas.

### Phase 2 --- Authentication and roles

-   Implement registration.
-   Implement login and logout.
-   Create student and admin roles.
-   Protect student pages.
-   Protect admin pages.
-   Create admin account provisioning.

**Acceptance criteria:** Users can authenticate, and role restrictions
are enforced server-side.

### Phase 3 --- Weekly cycle, menu, and prices

-   Implement week creation.
-   Implement menu schema and admin editor.
-   Seed the supplied menu.
-   Implement weekly price configuration.
-   Implement student menu view.

**Acceptance criteria:** Admin can configure a week, and students can
view the same menu and prices.

### Phase 4 --- Student booking

-   Implement meal selection UI.
-   Implement alternative selection.
-   Implement dynamic frontend total.
-   Implement server-side price calculation.
-   Enforce ₹300 minimum.
-   Implement booking submission.
-   Implement booking history.

**Acceptance criteria:** A student can submit a valid weekly booking and
see it as pending.

### Phase 5 --- Admin booking verification

-   Implement booking request table.
-   Implement filters and search.
-   Implement booking details.
-   Implement physical payment verification.
-   Implement approval and rejection.
-   Store admin and timestamps.

**Acceptance criteria:** Admin can verify payment and approve a pending
booking safely.

### Phase 6 --- Coupon system

-   Generate coupons during approval.
-   Ensure unique coupon IDs.
-   Implement student coupon page.
-   Implement admin coupon view.
-   Prevent duplicate coupon generation.

**Acceptance criteria:** Approved bookings generate exactly one coupon
for each booking item.

### Phase 7 --- Testing and deployment

-   Run business-rule tests.
-   Run role and access tests.
-   Run booking and coupon tests.
-   Deploy to Vercel.
-   Configure production Atlas connection.
-   Seed demo data.
-   Verify public URL.

**Acceptance criteria:** Teacher can use the deployed application to
complete the student and admin workflow.

------------------------------------------------------------------------

## 14. Suggested Repository Structure

``` text
mess-management-system/
├── app/
│   ├── login/
│   ├── register/
│   ├── student/
│   │   ├── dashboard/
│   │   ├── menu/
│   │   ├── booking/
│   │   ├── bookings/
│   │   └── coupons/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── weeks/
│   │   ├── menu/
│   │   ├── prices/
│   │   ├── bookings/
│   │   ├── coupons/
│   │   └── students/
│   └── api/
├── components/
│   ├── ui/
│   ├── student/
│   ├── admin/
│   └── shared/
├── lib/
│   ├── auth/
│   ├── mongodb/
│   ├── validation/
│   └── utils/
├── models/
│   ├── User.ts
│   ├── Week.ts
│   ├── WeeklyMenu.ts
│   ├── WeeklyPrice.ts
│   ├── Booking.ts
│   ├── BookingItem.ts
│   ├── Payment.ts
│   ├── Coupon.ts
│   └── AuditLog.ts
├── services/
│   ├── booking.service.ts
│   ├── menu.service.ts
│   ├── payment.service.ts
│   └── coupon.service.ts
├── types/
├── middleware.ts
├── .env.example
├── README.md
└── planning.md
```

This structure is a recommendation. The coding agent may adjust it if
there is a clear architectural reason, but it must preserve separation
between UI, database models, validation, and business logic.

------------------------------------------------------------------------

## 15. Coding-Agent Instructions

This section is intended to be used by any coding agent implementing the
project.

### General instructions

1.  Read this planning document completely before writing code.
2.  Treat this file as the project's source of truth.
3.  Do not generate the whole application in one step.
4.  Implement one development phase at a time.
5.  Before each phase, summarize the intended changes.
6.  Preserve existing working functionality.
7.  Use TypeScript consistently.
8.  Use MongoDB Atlas and Mongoose; do not replace them with another
    database.
9.  Use Next.js for both frontend and backend.
10. Do not create a separate Express or FastAPI server.
11. Keep secrets out of source code.
12. Validate important business rules on the server.
13. Create reusable components and services.
14. Avoid unnecessary dependencies.
15. Do not invent additional business rules without documenting them.
16. If a requirement is ambiguous, identify it and ask for clarification
    or document a reasonable assumption.
17. Keep the application deployable on Vercel throughout development.

### Implementation workflow

For each phase:

1.  Inspect the current repository.
2.  Read this planning document.
3.  Identify the phase's requirements.
4.  Implement only the required phase and dependencies.
5.  Run TypeScript checks and linting.
6.  Test the relevant workflows.
7.  Fix errors before moving to the next phase.
8.  Update the README and planning notes if implementation decisions
    change.
9.  Summarize changed files and completed functionality.
10. State any remaining issues clearly.

### Critical requirements

-   Booking totals must be calculated server-side.
-   Minimum booking amount is ₹300.
-   Booking prices must be immutable after submission.
-   Students must not access admin functionality.
-   Admin approval must be protected and idempotent.
-   Coupons must only be generated after approval.
-   Duplicate coupon generation must be prevented.
-   MongoDB connection handling must be compatible with Vercel
    serverless functions.
-   Student data must be protected by ownership checks.

------------------------------------------------------------------------

## 16. Acceptance Criteria for Final Project

The project is ready for evaluation when all of the following are true:

-   A student can register and log in.
-   An admin can log in securely.
-   Admin can create a weekly booking cycle.
-   Admin can edit the weekly menu.
-   Admin can set weekly prices.
-   Student can view the menu.
-   Student can select meals for the week.
-   The application calculates the total correctly.
-   Booking under ₹300 is blocked.
-   Booking at or above ₹300 can be submitted.
-   Booking appears in admin pending requests.
-   Admin can record physical payment verification.
-   Admin can approve or reject the booking.
-   Approved booking generates one coupon per meal.
-   Student can view coupons.
-   Student cannot access another student's data.
-   Student cannot access admin features.
-   Application is deployed on Vercel.
-   MongoDB Atlas is used as the persistent database.
-   The complete workflow works using the public deployment URL.

------------------------------------------------------------------------

## 17. Decisions and Assumptions to Confirm

The following assumptions are used in this plan:

1.  The mess week is Monday through Sunday.
2.  Minimum booking amount is ₹300 per student per week.
3.  One coupon is generated for each selected meal.
4.  Students choose between menu alternatives during booking.
5.  Physical payment is verified by the admin.
6.  The admin controls booking opening and closing times.
7.  Submitted bookings preserve their menu and price snapshots.
8.  Online payments are not part of the MVP.

These should be confirmed with the mess admin or project supervisor
before implementation.

------------------------------------------------------------------------

## 18. Final Project Summary

The Smart Mess Meal Booking and Coupon Management System will digitize
the college mess's weekly meal-coupon workflow.

Students will log in, view the weekly menu, select meals, and submit
bookings worth at least ₹300. The mess admin will manage the weekly menu
and prices, review booking requests, verify physical payments, and
approve bookings. The system will then generate digital coupons for the
selected meals.

The application will use Next.js, TypeScript, Tailwind CSS, MongoDB
Atlas, and Mongoose. The frontend and backend will be maintained in a
single GitHub repository and deployed together on Vercel.

The project should be developed incrementally, tested thoroughly, and
kept simple enough to demonstrate reliably during college evaluation.
