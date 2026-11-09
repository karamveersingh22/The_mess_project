"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { DEFAULT_PRICES } from "@/types";

interface MealOption {
  label: string;
  description: string;
}

interface MealItem {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  description: string;
  options: MealOption[];
  isAvailable: boolean;
}

interface DayMenu {
  date: string;
  dayOfWeek: string;
  meals: MealItem[];
}

interface WeekItem {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface PriceConfig {
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  minimumBookingAmount: number;
}

export default function StudentMenuViewPage() {
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [days, setDays] = useState<DayMenu[]>([]);
  const [prices, setPrices] = useState<PriceConfig>({
    breakfastPrice: DEFAULT_PRICES.breakfast,
    lunchPrice: DEFAULT_PRICES.lunch,
    dinnerPrice: DEFAULT_PRICES.dinner,
    minimumBookingAmount: DEFAULT_PRICES.minimumBookingAmount,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/weeks");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setWeeks(data.data);
          // Prefer OPEN week if available
          const openWeek = data.data.find((w: WeekItem) => w.status === "OPEN");
          setSelectedWeekId(openWeek ? openWeek._id : data.data[0]._id);
        }
      } catch {
        setError("Failed to load available weeks");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedWeekId) return;

    async function loadData() {
      try {
        const [menuRes, priceRes] = await Promise.all([
          fetch(`/api/menu/${selectedWeekId}`),
          fetch(`/api/prices/${selectedWeekId}`),
        ]);

        const menuData = await menuRes.json();
        const priceData = await priceRes.json();

        if (menuData.success && menuData.data?.days) {
          setDays(menuData.data.days);
        } else {
          setDays([]);
        }

        if (priceData.success && priceData.data) {
          setPrices({
            breakfastPrice: priceData.data.breakfastPrice ?? DEFAULT_PRICES.breakfast,
            lunchPrice: priceData.data.lunchPrice ?? DEFAULT_PRICES.lunch,
            dinnerPrice: priceData.data.dinnerPrice ?? DEFAULT_PRICES.dinner,
            minimumBookingAmount: priceData.data.minimumBookingAmount ?? DEFAULT_PRICES.minimumBookingAmount,
          });
        }
      } catch {
        setError("Failed to fetch menu details");
      }
    }

    loadData();
  }, [selectedWeekId]);

  const activeWeek = weeks.find((w) => w._id === selectedWeekId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Mess Menu</h1>
          <p className="text-sm text-gray-600">
            Browse daily meals, check specials, and plan your weekly meal bookings.
          </p>
        </div>
        {activeWeek?.status === "OPEN" && (
          <Link href="/student/booking">
            <Button size="lg">
              🍽️ Book Meals for This Week →
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Week Selector & Rate Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Select Week:</span>
          <select
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {weeks.map((w) => (
              <option key={w._id} value={w._id}>
                {formatDate(w.startDate)} – {formatDate(w.endDate)} ({w.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
          <div>Breakfast: <span className="text-blue-900 font-bold">₹{prices.breakfastPrice}</span></div>
          <div>Lunch: <span className="text-blue-900 font-bold">₹{prices.lunchPrice}</span></div>
          <div>Dinner: <span className="text-blue-900 font-bold">₹{prices.dinnerPrice}</span></div>
          <div>Min Booking: <span className="text-blue-900 font-bold">₹{prices.minimumBookingAmount}</span></div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading menu...</div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No menu configured for this week yet. Please check back soon or choose another week.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <Card key={day.dayOfWeek} className="overflow-hidden flex flex-col">
              <CardHeader className="bg-blue-900 text-white py-3 px-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">{day.dayOfWeek}</span>
                  <span className="text-xs text-blue-200">{formatDate(day.date)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4 flex-1">
                {day.meals.map((meal) => {
                  let price = prices.breakfastPrice;
                  if (meal.mealType === "LUNCH") price = prices.lunchPrice;
                  if (meal.mealType === "DINNER") price = prices.dinnerPrice;

                  return (
                    <div
                      key={meal.mealType}
                      className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          {meal.mealType}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">₹{price}</span>
                          {!meal.isAvailable && (
                            <Badge variant="danger">Unavailable</Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {meal.description}
                      </p>

                      {meal.options && meal.options.length > 0 && (
                        <div className="mt-2 rounded bg-amber-50 p-2 border border-amber-200/60">
                          <span className="text-xs font-semibold text-amber-900 block mb-1">
                            Available Choices:
                          </span>
                          <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                            {meal.options.map((opt, i) => (
                              <li key={i}>
                                <span className="font-medium">{opt.label}</span>
                                {opt.description && ` — ${opt.description}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

