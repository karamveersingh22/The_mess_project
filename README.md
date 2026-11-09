# MessBook — Smart Mess Meal Booking & Coupon Management System

A Next.js web application that digitizes the college mess's weekly meal-coupon workflow. Students select meals, submit bookings, and receive digital coupons after admin verification.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Custom JWT-based authentication
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your MongoDB URI and secrets
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Secret key for JWT signing |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # API Route Handlers
│   ├── login/        # Login page
│   ├── register/     # Registration page
│   ├── student/      # Student pages
│   └── admin/        # Admin pages
├── components/       # React components
│   ├── ui/           # Base UI components
│   ├── shared/       # Shared layout components
│   ├── student/      # Student-specific components
│   └── admin/        # Admin-specific components
├── lib/              # Utilities & helpers
│   ├── auth/         # Authentication logic
│   ├── mongodb/      # Database connection
│   ├── validation/   # Input validation
│   └── utils/        # General utilities
├── models/           # Mongoose schemas
├── services/         # Business logic services
└── types/            # TypeScript type definitions
```

## Default Meal Prices

| Meal | Price |
|------|-------|
| Breakfast | ₹25 |
| Lunch | ₹45 |
| Dinner | ₹40 |

**Minimum booking amount:** ₹300 per student per week.

## License

This project is for educational purposes.
