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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Welcome Header */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0D1E4C 0%, #26415E 70%, #0B1B32 100%)',
          border: '1.5px solid #83A6CE33',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-white/10 text-white border border-white/15">
              <span>🎓</span>
              <span>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Roll Number: <span className="font-bold text-white">{user?.rollNumber || "..."}</span> • College Hostel & Mess
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/student/booking">
              <Button
                size="md"
                className="font-bold shadow-lg"
                style={{ background: '#FFFFFF', color: '#0D1E4C' }}
              >
                🍽️ Book Next Week&apos;s Meals
              </Button>
            </Link>
            <Link href="/student/coupons">
              <Button
                size="md"
                className="font-bold hover:opacity-90"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(255,255,255,0.45)',
                  color: '#FFFFFF'
                }}
              >
                🎫 View My Passes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Booking */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Active Booking
          </span>
          <div className="mt-3">
            {loading ? (
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : metrics?.activeBooking ? (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={getStatusVariant(metrics.activeBooking.status)}>
                    {metrics.activeBooking.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {metrics.activeBooking.bookingCode}
                  </span>
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--brand-blue)' }}>
                  ₹{metrics.activeBooking.totalAmount} ({metrics.activeBooking.totalMeals} meals)
                </p>
              </div>
            ) : (
              <div>
                <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>None Active</div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Select meals for upcoming cycle
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Passes */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Available Passes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: 'var(--brand-blue)' }}>
              {loading ? "..." : metrics?.couponCount ?? 0}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>passes issued</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Ready for counter check-in
          </p>
        </div>

        {/* Minimum Booking */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Minimum Booking
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              ₹{metrics?.prices.minimumBookingAmount ?? 300}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ cycle</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Required threshold per week
          </p>
        </div>

        {/* Standard Rates */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Meal Rates
          </span>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>Breakfast:</span>
              <span style={{ color: 'var(--brand-rose)' }}>₹{metrics?.prices.breakfast ?? 25}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>Lunch:</span>
              <span style={{ color: 'var(--brand-blue)' }}>₹{metrics?.prices.lunch ?? 45}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>Dinner:</span>
              <span style={{ color: 'var(--brand-slate)' }}>₹{metrics?.prices.dinner ?? 40}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Week Banner */}
      {metrics?.activeWeek && (
        <div
          className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-brand)' }}
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--brand-blue)' }}>
              Current Active Mess Cycle
            </span>
            <span className="text-base font-extrabold mt-0.5 block" style={{ color: 'var(--text-primary)' }}>
              {formatDate(metrics.activeWeek.startDate)} – {formatDate(metrics.activeWeek.endDate)}
            </span>
          </div>
          <div className="flex gap-2.5">
            <Link href="/student/menu">
              <Button size="sm" variant="secondary">
                View Weekly Menu
              </Button>
            </Link>
            <Link href="/student/booking">
              <Button size="sm">
                Book This Week →
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
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              After selecting your preferred meals and submitting your booking online, visit the mess administrative counter in person to deposit the exact cash amount.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The mess cashier will verify your booking reference ID and click approve. Digital coupons and 5-digit attendance codes are issued instantly upon approval.
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
            <CardTitle>Mess Counter Attendance Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Zero paper coupons needed! Simply open your mobile phone and view &quot;My Passes&quot; to see your 5-digit verification code for today&apos;s meal.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Tell this code to the server at the gate. The admin enters the 5 digits to mark attendance and hand over your plate.
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
