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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Coupon Administration</h1>
        <p className="text-sm text-gray-600">
          Track verified coupons issued to students. Use meal counts for daily kitchen quantity preparation.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase block font-semibold">Total Coupons Issued</span>
            <span className="text-2xl font-black text-blue-900">{coupons.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase block font-semibold">Breakfast Coupons</span>
            <span className="text-2xl font-black text-amber-600">{breakfastCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase block font-semibold">Lunch Coupons</span>
            <span className="text-2xl font-black text-green-600">{lunchCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase block font-semibold">Dinner Coupons</span>
            <span className="text-2xl font-black text-purple-600">{dinnerCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700">Filter Week:</span>
          <select
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Weeks</option>
            {weeks.map((w) => (
              <option key={w._id} value={w._id}>
                {formatDate(w.startDate)} – {formatDate(w.endDate)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((mt) => (
            <button
              key={mt}
              onClick={() => setMealTypeFilter(mt)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mealTypeFilter === mt
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {mt}
            </button>
          ))}
        </div>
      </div>

      {/* Coupon Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No coupons issued for this selection.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">5-Digit Code</th>
                    <th className="px-6 py-3">Coupon Code</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Meal Type</th>
                    <th className="px-6 py-3">Valid Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-black text-sm text-amber-900 bg-amber-50/50">
                        {c.verificationCode || "—"}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs text-blue-950">
                        {c.couponCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{c.studentId?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {c.studentId?.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{c.mealType}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-900">
                        {formatDate(c.date)}
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-600">
                        {c.mealDescriptionSnapshot}
                      </td>
                      <td className="px-6 py-4">
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

