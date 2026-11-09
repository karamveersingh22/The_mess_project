"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface StudentInfo {
  name: string;
  rollNumber: string;
  email: string;
}

interface CouponRecord {
  _id: string;
  couponCode: string;
  verificationCode?: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mealDescriptionSnapshot: string;
  status: string;
  generatedAt: string;
  studentId?: StudentInfo;
  bookingId?: { bookingCode: string };
  weekId?: { startDate: string; endDate: string };
}

interface WeekOption {
  _id: string;
  startDate: string;
  endDate: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("ALL");
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeeks() {
      try {
        const res = await fetch("/api/weeks");
        const data = await res.json();
        if (data.success) {
          setWeeks(data.data);
        }
      } catch {
        console.error("Failed to load weeks");
      }
    }
    loadWeeks();
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedWeekId !== "ALL") params.set("weekId", selectedWeekId);
      if (mealTypeFilter !== "ALL") params.set("mealType", mealTypeFilter);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      } else {
        setError(data.error || "Failed to load coupons");
      }
    } catch {
      setError("Network error fetching coupons");
    } finally {
      setLoading(false);
    }
  }, [selectedWeekId, mealTypeFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Breakdown metrics
  const breakfastCount = coupons.filter((c) => c.mealType === "BREAKFAST").length;
  const lunchCount = coupons.filter((c) => c.mealType === "LUNCH").length;
  const dinnerCount = coupons.filter((c) => c.mealType === "DINNER").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎫</span>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Digital Coupon & Pass Registry
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track issued student coupons and 5-digit verification codes for kitchen capacity planning.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Total Passes
          </span>
          <span className="text-2xl font-black mt-1 block" style={{ color: 'var(--brand-blue)' }}>
            {coupons.length}
          </span>
        </div>
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Breakfast Passes
          </span>
          <span className="text-2xl font-black mt-1 block" style={{ color: 'var(--brand-rose)' }}>
            {breakfastCount}
          </span>
        </div>
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Lunch Passes
          </span>
          <span className="text-2xl font-black mt-1 block" style={{ color: 'var(--brand-blue)' }}>
            {lunchCount}
          </span>
        </div>
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Dinner Passes
          </span>
          <span className="text-2xl font-black mt-1 block" style={{ color: 'var(--brand-slate)' }}>
            {dinnerCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Cycle:
          </span>
          <select
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors outline-none cursor-pointer"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)'
            }}
          >
            <option value="ALL">All Cycles</option>
            {weeks.map((w) => (
              <option key={w._id} value={w._id}>
                {formatDate(w.startDate)} – {formatDate(w.endDate)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((mt) => (
            <button
              key={mt}
              onClick={() => setMealTypeFilter(mt)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={mealTypeFilter === mt ? {
                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                color: '#FFFFFF',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              {mt}
            </button>
          ))}
        </div>
      </div>

      {/* Coupon Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Digital Passes ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No coupons issued for this selection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                <thead
                  className="text-xs uppercase font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-muted)' }}
                >
                  <tr>
                    <th className="px-6 py-3.5">5-Digit Counter Code</th>
                    <th className="px-6 py-3.5">Coupon Ref</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Meal Type</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Menu Snapshot</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {coupons.map((c) => (
                    <tr
                      key={c._id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-sm font-black px-2.5 py-1 rounded-md"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--brand-blue)' }}
                        >
                          {c.verificationCode || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {c.couponCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {c.studentId?.name || "Student"}
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {c.studentId?.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: '#83A6CE20', color: 'var(--brand-blue)' }}>
                          {c.mealType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatDate(c.date)}
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {c.mealDescriptionSnapshot}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
