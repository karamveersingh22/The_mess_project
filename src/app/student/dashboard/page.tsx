import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function StudentDashboardPage() {
  const user = await getSessionUser();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-blue-900 p-6 sm:p-8 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-blue-200 text-sm sm:text-base">
          Roll Number: <span className="font-semibold text-white">{user?.rollNumber}</span> | College Mess Portal
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/student/booking">
            <Button variant="secondary" size="md">
              🍽️ Book Next Week&apos;s Meals
            </Button>
          </Link>
          <Link href="/student/coupons">
            <Button
              variant="outline"
              size="md"
              className="border-white text-white hover:bg-blue-800"
            >
              🎫 View My Coupons
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Booking
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">None Active</div>
            <p className="mt-1 text-xs text-gray-500">
              Check the upcoming booking cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Available Coupons
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="mt-1 text-xs text-gray-500">
              Coupons generated after approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Minimum Booking
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹300</div>
            <p className="mt-1 text-xs text-gray-500">
              Per weekly cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Meal Prices
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">
              B: ₹25 | L: ₹45 | D: ₹40
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Default standard rates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Check what&apos;s cooking this week from Monday to Sunday, including specials and alternative options.
            </p>
            <Link href="/student/menu" className="inline-block">
              <Button variant="outline" size="sm">
                View Weekly Menu →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              After submitting your meal selections, visit the mess counter to complete your physical cash payment. Once the admin marks your payment verified, your digital coupons will appear immediately.
            </p>
            <Link href="/student/history" className="inline-block">
              <Button variant="outline" size="sm">
                Check Booking Status →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

