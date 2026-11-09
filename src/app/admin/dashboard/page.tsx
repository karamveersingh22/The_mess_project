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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Admin Header */}
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
              <span>🛡️</span>
              <span>Mess Staff Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Mess Admin Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Cash verification, attendance gate tracking, and meal lifecycle management.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/admin/counter">
              <Button
                size="md"
                className="font-black shadow-lg"
                style={{ background: '#E5C9D7', color: '#0D1E4C' }}
              >
                ⚡ Counter Gate
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button size="md" className="font-bold">
                Cash Approvals
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="md"
              onClick={handleSeedDemoData}
              isLoading={seeding}
              className="font-bold"
            >
              Seed Demo
            </Button>
          </div>
        </div>
      </div>

      {seedSuccess && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          ✓ {seedSuccess}
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Cash Approvals */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Pending Cash Approvals
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: metrics?.pendingCount ? '#DC2626' : 'var(--text-primary)' }}>
              {loading ? "..." : metrics?.pendingCount ?? 0}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>awaiting counter cash</span>
          </div>
          <Link
            href="/admin/bookings?status=PENDING"
            className="text-xs font-bold mt-2 inline-block hover:underline"
            style={{ color: 'var(--brand-blue)' }}
          >
            Review pending →
          </Link>
        </div>

        {/* Approved Bookings */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Approved Bookings
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {loading ? "..." : metrics?.approvedCount ?? 0}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>verified orders</span>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Active weekly bookings
          </p>
        </div>

        {/* Total Cash Collected */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Verified Revenue
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: 'var(--brand-blue)' }}>
              ₹{loading ? "..." : metrics?.totalVerifiedAmount ?? 0}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>INR</span>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Physical cash accounted
          </p>
        </div>

        {/* Active Digital Passes */}
        <div
          className="rounded-2xl p-5 shadow-sm transition-all"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Coupons Issued
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              {loading ? "..." : metrics?.couponCount ?? 0}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>with 5-digit codes</span>
          </div>
          <Link
            href="/admin/coupons"
            className="text-xs font-bold mt-2 inline-block hover:underline"
            style={{ color: 'var(--brand-blue)' }}
          >
            Inspect passes →
          </Link>
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
              Current Operating Cycle
            </span>
            <span className="text-base font-extrabold mt-0.5 block" style={{ color: 'var(--text-primary)' }}>
              {formatDate(metrics.activeWeek.startDate)} – {formatDate(metrics.activeWeek.endDate)}
            </span>
          </div>
          <div className="flex gap-2.5">
            <Link href="/admin/menu">
              <Button size="sm" variant="secondary">
                Edit Cycle Menu
              </Button>
            </Link>
            <Link href="/admin/weeks">
              <Button size="sm" variant="outline">
                Manage Cycles
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Admin Action Directory */}
      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: '#83A6CE20', color: 'var(--brand-blue)' }}>
              ⚡
            </div>
            <h3 className="font-extrabold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Attendance Tracker
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Gate distribution console. Type the student&apos;s 5-digit verification code to instantly mark attendance.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/admin/counter">
              <Button size="sm" className="w-full">
                Open Counter Console →
              </Button>
            </Link>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: '#C48CB320', color: 'var(--brand-rose)' }}>
              💵
            </div>
            <h3 className="font-extrabold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Cash Verification
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Approve student bookings upon collecting physical cash. Generates digital meal coupons automatically.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/admin/bookings">
              <Button size="sm" variant="secondary" className="w-full">
                Manage Cash Requests →
              </Button>
            </Link>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: '#26415E20', color: 'var(--brand-slate)' }}>
              ⚙️
            </div>
            <h3 className="font-extrabold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Menu & Pricing
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Configure breakfast, lunch, and dinner meal offerings, dietary options, and minimum threshold amounts.
            </p>
          </div>
          <div className="pt-4 flex gap-2">
            <Link href="/admin/menu" className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                Menu
              </Button>
            </Link>
            <Link href="/admin/prices" className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                Prices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
