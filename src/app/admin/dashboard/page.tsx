"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface MetricsData {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalVerifiedAmount: number;
  couponCount: number;
  studentCount: number;
  activeWeek?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  async function loadMetrics() {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch {
      console.error("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  async function handleSeedDemoData() {
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const res = await fetch("/api/admin/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedSuccess(
          "Demo dataset initialized! Current week, menus, prices, demo students, pending booking, and approved coupons are ready."
        );
        loadMetrics();
      }
    } catch {
      console.error("Seeding failed");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="rounded-2xl bg-blue-950 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Mess Admin Control Center
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              College Mess Booking & Digital Coupon Distribution System
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleSeedDemoData}
              isLoading={seeding}
            >
              ⚡ Quick-Seed Demo Data
            </Button>
            <Link href="/admin/bookings">
              <Button variant="success" size="md">
                Review Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {seedSuccess && (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-300">
          ✓ {seedSuccess}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pending Bookings
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {loading ? "..." : metrics?.pendingCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Awaiting physical cash verification
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
            <div className="text-3xl font-bold text-green-600">
              {loading ? "..." : metrics?.approvedCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Payment confirmed & coupons issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Cash Verified
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ₹{loading ? "..." : (metrics?.totalVerifiedAmount ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Excludes unverified pending requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Week Status
            </span>
          </CardHeader>
          <CardContent>
            {metrics?.activeWeek ? (
              <div>
                <div className="text-base font-bold text-green-700">
                  OPEN FOR BOOKING
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(metrics.activeWeek.startDate)} – {formatDate(metrics.activeWeek.endDate)}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-gray-700">
                  No Open Cycle
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Configure in Weekly Cycles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auxiliary Statistics */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Registered Students
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : metrics?.studentCount ?? 0} Students
              </div>
              <p className="text-xs text-gray-500 mt-1">Active college student accounts</p>
            </div>
            <Link href="/admin/students">
              <Button variant="outline" size="sm">
                View Directory →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Digital Coupons Issued
              </span>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {loading ? "..." : metrics?.couponCount ?? 0} Coupons
              </div>
              <p className="text-xs text-gray-500 mt-1">1 coupon per selected meal</p>
            </div>
            <Link href="/admin/coupons">
              <Button variant="outline" size="sm">
                View Coupons →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Core Workflow Operations */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1. Booking Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Create the Monday–Sunday booking cycle, configure start/end window, and open or close bookings.
            </p>
            <Link href="/admin/weeks" className="inline-block">
              <Button variant="outline" size="sm">
                Manage Cycles →
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
              Edit the 7-day schedule with food alternatives (Chicken/Paneer, Veg/Egg) and item availability.
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
              Set weekly rates (B: ₹25, L: ₹45, D: ₹40) and enforce the ₹300 minimum weekly booking threshold.
            </p>
            <Link href="/admin/prices" className="inline-block">
              <Button variant="outline" size="sm">
                Manage Prices →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
