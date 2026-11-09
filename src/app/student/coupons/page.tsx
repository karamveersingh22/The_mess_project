"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate, isSameDayInAppTZ } from "@/lib/utils";

interface CouponItem {
  _id: string;
  couponCode: string;
  verificationCode?: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mealDescriptionSnapshot: string;
  status: "ACTIVE" | "REDEEMED" | "CANCELLED";
  generatedAt: string;
  redeemedAt?: string;
  bookingId?: {
    bookingCode: string;
  };
  weekId?: {
    startDate: string;
    endDate: string;
  };
}

export default function StudentCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch("/api/coupons");
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
    }
    loadCoupons();
  }, []);

  const todayCoupons = coupons.filter((c) => isSameDayInAppTZ(c.date));

  const filteredCoupons = coupons.filter((c) => {
    if (selectedFilter === "ALL") return true;
    return c.mealType === selectedFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digital Meal Pass & Attendance Codes</h1>
          <p className="text-sm text-gray-600">
            Tell the <strong className="text-blue-900">5-digit code</strong> to the mess staff at the counter to mark your attendance and collect your meal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedFilter === filter
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* TODAY'S ACTIVE MEAL PASS HIGHLIGHT BANNER */}
      {!loading && todayCoupons.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 shadow-lg border border-blue-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-800/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-lg font-bold">Today&apos;s Active Meal Passes</h2>
                <p className="text-xs text-blue-200">{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <span className="bg-yellow-400 text-yellow-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Live For Today
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayCoupons.map((c) => (
              <div
                key={c._id}
                className={`rounded-xl p-4 border transition-all ${
                  c.status === "REDEEMED"
                    ? "bg-blue-950/60 border-blue-800 opacity-80"
                    : "bg-white text-gray-900 border-white shadow-md ring-2 ring-yellow-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    c.status === "REDEEMED" ? "bg-gray-800 text-gray-300" : "bg-blue-100 text-blue-900"
                  }`}>
                    {c.mealType}
                  </span>
                  <Badge variant={getStatusVariant(c.status)}>
                    {c.status === "REDEEMED" ? "USED" : "READY TO EAT"}
                  </Badge>
                </div>

                <div className="text-center my-3 py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block mb-1">
                    5-Digit Counter Code
                  </span>
                  <div className="font-mono text-3xl font-black tracking-widest text-blue-950">
                    {c.verificationCode || "N/A"}
                  </div>
                </div>

                <p className={`text-xs line-clamp-2 ${c.status === "REDEEMED" ? "text-blue-200" : "text-gray-600"}`}>
                  {c.mealDescriptionSnapshot}
                </p>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  {c.status === "REDEEMED" ? (
                    <span className="text-green-400 font-medium">
                      ✓ Redeemed {c.redeemedAt ? new Date(c.redeemedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Today"}
                    </span>
                  ) : (
                    <span className="text-blue-700 font-semibold">
                      👉 Tell this code at counter
                    </span>
                  )}
                  <span className="text-gray-400 font-mono text-[10px]">{c.couponCode.substring(0, 10)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading your coupons...</div>
      ) : coupons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500 space-y-3">
            <div className="text-4xl">🎫</div>
            <h3 className="text-lg font-bold text-gray-800">No Digital Coupons Yet</h3>
            <p className="text-sm max-w-md mx-auto text-gray-600">
              Coupons are automatically issued as soon as the mess admin verifies your physical payment and approves your booking request.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/student/booking">
                <Button size="sm">Book Meals</Button>
              </Link>
              <Link href="/student/history">
                <Button size="sm" variant="outline">
                  Check Booking Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-4">All Weekly Coupons</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border-2 border-blue-900/20 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍽️</span>
                      <span className="font-bold text-sm text-blue-900">
                        {c.mealType} PASS
                      </span>
                    </div>
                    <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="text-xs text-gray-500 font-medium">Valid On:</div>
                    <div className="text-base font-bold text-gray-900">
                      {formatDate(c.date)}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {c.mealDescriptionSnapshot}
                    </p>
                  </div>
                </div>

                {/* 5-Digit Counter Code Box */}
                <div className="my-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                    Attendance 5-Digit Code
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-950 tracking-widest block">
                    {c.verificationCode || "—"}
                  </span>
                  <span className="text-[10px] text-amber-700">
                    {c.status === "REDEEMED"
                      ? `Redeemed ${c.redeemedAt ? new Date(c.redeemedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}`
                      : "Present this code at mess counter"}
                  </span>
                </div>

                {/* Coupon Code Strip */}
                <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200 bg-blue-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                        System ID
                      </span>
                      <span className="font-mono text-xs font-bold text-blue-950">
                        {c.couponCode}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">
                        Ref: {c.bookingId?.bookingCode || "BK"}
                      </span>
                      <span className="text-[10px] text-green-700 font-semibold">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
