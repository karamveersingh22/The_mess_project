"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface StudentMetrics {
  activeWeek?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  activeBooking?: {
    id: string;
    bookingCode: string;
    totalAmount: number;
    totalMeals: number;
    status: string;
    paymentStatus: string;
  } | null;
  couponCount: number;
  prices: {
    breakfast: number;
    lunch: number;
    dinner: number;
    minimumBookingAmount: number;
  };
}

interface UserSession {
  name: string;
  rollNumber: string;
  email: string;
}

export default function StudentDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, metRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/student/metrics"),
        ]);
        const meData = await meRes.json();
        const metData = await metRes.json();

        if (meData.success) setUser(meData.data);
        if (metData.success) setMetrics(metData.data);
      } catch {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-blue-900 p-6 sm:p-8 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {user?.name || "Student"}!
        </h1>
        <p className="mt-2 text-blue-200 text-sm sm:text-base">
          Roll Number: <span className="font-semibold text-white">{user?.rollNumber || "..."}</span> | College Mess Portal
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
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : metrics?.activeBooking ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getStatusVariant(metrics.activeBooking.status)}>
                    {metrics.activeBooking.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-gray-700">
                    {metrics.activeBooking.bookingCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  ₹{metrics.activeBooking.totalAmount} ({metrics.activeBooking.totalMeals} meals)
                </p>
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold text-gray-700">None Active</div>
                <p className="mt-1 text-xs text-gray-500">
                  Select meals for upcoming cycle
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Available Coupons
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-900">
              {loading ? "..." : metrics?.couponCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Active digital passes
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
            <div className="text-2xl font-bold text-gray-900">
              ₹{metrics?.prices.minimumBookingAmount ?? 300}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Per weekly cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Standard Rates
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-gray-900">
              B: ₹{metrics?.prices.breakfast ?? 25} | L: ₹{metrics?.prices.lunch ?? 45} | D: ₹{metrics?.prices.dinner ?? 40}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Per meal rates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Week Banner */}
      {metrics?.activeWeek && (
        <div className="rounded-xl bg-white p-4 border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-blue-900 block">
              Active Mess Week
            </span>
            <span className="text-base font-bold text-gray-900">
              {formatDate(metrics.activeWeek.startDate)} – {formatDate(metrics.activeWeek.endDate)}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href="/student/menu">
              <Button size="sm" variant="outline">
                View Weekly Menu
              </Button>
            </Link>
            <Link href="/student/booking">
              <Button size="sm">
                Book This Week
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Guides */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Physical Payment Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              After submitting your meal booking online, visit the mess administration office in person to pay the exact cash amount.
            </p>
            <p className="text-sm text-gray-600">
              The mess admin will verify the physical cash and click approve. Your digital coupons will appear immediately under &quot;My Coupons&quot;.
            </p>
            <div className="pt-2">
              <Link href="/student/history">
                <Button variant="outline" size="sm">
                  Check Booking & Payment Status →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mess Coupon Counter Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              No paper slips required! Simply open the &quot;My Coupons&quot; page on your mobile device and present the digital coupon pass to the mess staff at meal time.
            </p>
            <p className="text-sm text-gray-600">
              Each coupon displays your student details, date, and selected alternative (e.g. Chicken or Paneer).
            </p>
            <div className="pt-2">
              <Link href="/student/coupons">
                <Button variant="outline" size="sm">
                  Open Coupon Wallet →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
