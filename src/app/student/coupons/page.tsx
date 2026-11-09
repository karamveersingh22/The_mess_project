"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface CouponItem {
  _id: string;
  couponCode: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mealDescriptionSnapshot: string;
  status: string;
  generatedAt: string;
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

  const filteredCoupons = coupons.filter((c) => {
    if (selectedFilter === "ALL") return true;
    return c.mealType === selectedFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Digital Meal Coupons</h1>
          <p className="text-sm text-gray-600">
            Show these verified digital coupons at the mess distribution counter for your meal.
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

              {/* Coupon Code Strip */}
              <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200 bg-blue-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                      Coupon Code
                    </span>
                    <span className="font-mono text-sm font-extrabold text-blue-950 tracking-wider">
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
      )}
    </div>
  );
}

