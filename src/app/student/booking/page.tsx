"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { DEFAULT_PRICES, MealType } from "@/types";

interface MealOption {
  label: string;
  description: string;
}

interface MealItem {
  mealType: MealType;
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
  bookingStart: string;
  bookingEnd: string;
  status: string;
}

interface SelectedMealState {
  date: string;
  mealType: MealType;
  selectedOption: string;
}

export default function StudentBookingPage() {
  const router = useRouter();
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [days, setDays] = useState<DayMenu[]>([]);
  const [prices, setPrices] = useState({
    breakfastPrice: DEFAULT_PRICES.breakfast,
    lunchPrice: DEFAULT_PRICES.lunch,
    dinnerPrice: DEFAULT_PRICES.dinner,
    minimumBookingAmount: DEFAULT_PRICES.minimumBookingAmount,
  });

  const [selectedMeals, setSelectedMeals] = useState<Map<string, SelectedMealState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/weeks");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setWeeks(data.data);
          const openWeek = data.data.find((w: WeekItem) => w.status === "OPEN");
          setSelectedWeekId(openWeek ? openWeek._id : data.data[0]._id);
        }
      } catch {
        setError("Failed to load booking cycles");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedWeekId) return;

    async function loadWeekData() {
      setError(null);
      setSuccessCode(null);
      setSelectedMeals(new Map());
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
        setError("Failed to fetch menu or pricing");
      }
    }

    loadWeekData();
  }, [selectedWeekId]);

  function toggleMeal(date: string, mealType: MealType, defaultOption = "") {
    const key = `${date}_${mealType}`;
    setSelectedMeals((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, { date, mealType, selectedOption: defaultOption });
      }
      return next;
    });
  }

  function handleOptionChange(date: string, mealType: MealType, option: string) {
    const key = `${date}_${mealType}`;
    setSelectedMeals((prev) => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, { ...current, selectedOption: option });
      }
      return next;
    });
  }

  // Calculate live total
  let totalAmount = 0;
  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  selectedMeals.forEach((meal) => {
    if (meal.mealType === "BREAKFAST") {
      totalAmount += prices.breakfastPrice;
      breakfastCount++;
    } else if (meal.mealType === "LUNCH") {
      totalAmount += prices.lunchPrice;
      lunchCount++;
    } else if (meal.mealType === "DINNER") {
      totalAmount += prices.dinnerPrice;
      dinnerCount++;
    }
  });

  const totalMeals = selectedMeals.size;
  const isMinimumMet = totalAmount >= prices.minimumBookingAmount;
  const activeWeek = weeks.find((w) => w._id === selectedWeekId);
  const isOpen = activeWeek?.status === "OPEN";

  async function handleSubmitBooking() {
    if (!selectedWeekId) return;
    if (!isMinimumMet) {
      setError(`Minimum booking amount is ₹${prices.minimumBookingAmount}. Please select more meals.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const selections = Array.from(selectedMeals.values());

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekId: selectedWeekId,
          selections,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit booking");
      } else {
        setSuccessCode(data.data.bookingCode);
        setSelectedMeals(new Map());
      }
    } catch {
      setError("Network error submitting booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weekly Meal Booking</h1>
        <p className="text-sm text-gray-600">
          Select individual breakfast, lunch, and dinner meals for the week. The minimum booking amount is ₹{prices.minimumBookingAmount}.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {successCode && (
        <div className="rounded-xl bg-green-50 p-6 border border-green-300 text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <h2 className="text-xl font-bold text-green-900">
            Booking Request Submitted Successfully!
          </h2>
          <p className="text-sm text-green-700">
            Your Booking Reference ID is:{" "}
            <span className="font-mono font-bold text-green-900 bg-white px-2 py-1 rounded border border-green-200">
              {successCode}
            </span>
          </p>
          <p className="text-xs text-green-600">
            Next Step: Please visit the mess office to pay the physical cash amount. Your coupons will be generated once verified by admin.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button size="sm" onClick={() => router.push("/student/history")}>
              View in Booking History →
            </Button>
          </div>
        </div>
      )}

      {/* Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Select Cycle:</span>
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

        <div>
          {!isOpen && (
            <Badge variant="warning">
              Bookings are currently closed for this week cycle
            </Badge>
          )}
        </div>
      </div>

      {/* Floating Summary Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur p-4 rounded-xl border border-blue-200 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-xs text-gray-500 uppercase block">Selected Meals</span>
            <span className="text-xl font-bold text-gray-900">{totalMeals} meals</span>
            <span className="text-xs text-gray-400 block">
              B: {breakfastCount} | L: {lunchCount} | D: {dinnerCount}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-500 uppercase block">Total Amount</span>
            <span className="text-2xl font-black text-blue-900">₹{totalAmount}</span>
            <span className="text-xs text-gray-500 block">
              Min ₹{prices.minimumBookingAmount} required
            </span>
          </div>

          <div>
            {isMinimumMet ? (
              <Badge variant="success">✓ Minimum threshold met</Badge>
            ) : (
              <Badge variant="warning">
                Add ₹{prices.minimumBookingAmount - totalAmount} more to reach ₹{prices.minimumBookingAmount}
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleSubmitBooking}
          disabled={!isOpen || !isMinimumMet || totalMeals === 0}
          isLoading={submitting}
        >
          Submit Booking Request (₹{totalAmount})
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading meals...</div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No menu available for booking in this week.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const dateStr = new Date(day.date).toISOString().split("T")[0];

            return (
              <Card key={day.dayOfWeek} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-gray-900 font-bold">
                    {day.dayOfWeek} — {formatDate(day.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid gap-4 md:grid-cols-3">
                  {day.meals.map((meal) => {
                    const key = `${dateStr}_${meal.mealType}`;
                    const isSelected = selectedMeals.has(key);
                    const selectedData = selectedMeals.get(key);

                    let price = prices.breakfastPrice;
                    if (meal.mealType === "LUNCH") price = prices.lunchPrice;
                    if (meal.mealType === "DINNER") price = prices.dinnerPrice;

                    const defaultOpt = meal.options && meal.options.length > 0 ? meal.options[0].label : "";

                    return (
                      <div
                        key={meal.mealType}
                        className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                          !meal.isAvailable
                            ? "bg-gray-100 opacity-60 border-gray-200"
                            : isSelected
                            ? "bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                              {meal.mealType}
                            </span>
                            <span className="text-sm font-extrabold text-gray-900">
                              ₹{price}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                            {meal.description}
                          </p>

                          {/* Alternatives selection */}
                          {meal.options && meal.options.length > 0 && isSelected && (
                            <div className="mt-3 pt-3 border-t border-blue-200 space-y-1.5">
                              <span className="text-xs font-semibold text-blue-950 block">
                                Choose Option:
                              </span>
                              {meal.options.map((opt) => (
                                <label
                                  key={opt.label}
                                  className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`option_${key}`}
                                    value={opt.label}
                                    checked={selectedData?.selectedOption === opt.label}
                                    onChange={() => handleOptionChange(dateStr, meal.mealType, opt.label)}
                                    className="text-blue-900 focus:ring-blue-500"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-2">
                          {meal.isAvailable ? (
                            <button
                              type="button"
                              onClick={() => toggleMeal(dateStr, meal.mealType, defaultOpt)}
                              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                                isSelected
                                  ? "bg-blue-900 text-white hover:bg-blue-800"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {isSelected ? "✓ Selected (₹" + price + ")" : "+ Select Meal"}
                            </button>
                          ) : (
                            <div className="text-center text-xs text-gray-400 py-2">
                              Unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

