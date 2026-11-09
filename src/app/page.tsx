import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-blue-900">🍽️ MessBook</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Smart Mess Meal
            <span className="block text-blue-900">Booking System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Book your weekly mess meals online, get digital coupons, and skip
            the offline queue. Simple, fast, and hassle-free.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-900 px-8 py-3 text-base font-medium text-white hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/25"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-blue-900 px-8 py-3 text-base font-medium text-blue-900 hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-200 bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                  📋
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  1. Select Meals
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Browse the weekly menu and pick your breakfast, lunch, and
                  dinner for each day.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  💰
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  2. Pay & Get Verified
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Pay the mess admin in person. They&apos;ll verify your payment
                  and approve your booking.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                  🎫
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  3. Get Digital Coupons
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Once approved, your digital meal coupons are ready.
                  No more paper coupons!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} MessBook — Smart Mess Meal Booking &
            Coupon Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
