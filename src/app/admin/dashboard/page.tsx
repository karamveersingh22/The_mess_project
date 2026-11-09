import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="rounded-2xl bg-blue-950 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Admin Control Panel
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              Signed in as <span className="font-semibold text-white">{user?.name}</span> ({user?.email})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/bookings">
              <Button variant="success" size="md">
                Review Bookings
              </Button>
            </Link>
            <Link href="/admin/weeks">
              <Button variant="secondary" size="md">
                Manage Cycles
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pending Bookings
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">0</div>
            <p className="mt-1 text-xs text-gray-500">
              Awaiting physical payment verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Approved Bookings
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="mt-1 text-xs text-gray-500">
              Coupons generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Amount Verified
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">₹0</div>
            <p className="mt-1 text-xs text-gray-500">
              Only verified physical cash
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Week
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">Not Configured</div>
            <p className="mt-1 text-xs text-gray-500">
              Create a cycle in Weekly Cycles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operations Quick Links */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1. Booking Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Set the Monday–Sunday booking cycle and configure when students can submit meal bookings.
            </p>
            <Link href="/admin/weeks" className="inline-block">
              <Button variant="outline" size="sm">
                Open Cycles →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Weekly Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Edit daily breakfast, lunch, and dinner menus, including food item alternatives and availability.
            </p>
            <Link href="/admin/menu" className="inline-block">
              <Button variant="outline" size="sm">
                Edit Menu →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Meal Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Adjust weekly rates (Default: B: ₹25, L: ₹45, D: ₹40) and set minimum booking threshold (₹300).
            </p>
            <Link href="/admin/prices" className="inline-block">
              <Button variant="outline" size="sm">
                Manage Rates →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

