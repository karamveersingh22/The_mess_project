"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
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
  const [activeDayFilter, setActiveDayFilter] = useState<string>("ALL");
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

  // Quick helper: select all available meals of a type
  function selectAllOfType(type: MealType) {
    setSelectedMeals((prev) => {
      const next = new Map(prev);
      days.forEach((d) => {
        const dateStr = new Date(d.date).toISOString().split("T")[0];
        const meal = d.meals.find((m) => m.mealType === type);
        if (meal && meal.isAvailable) {
          const key = `${dateStr}_${type}`;
          const defaultOpt = meal.options && meal.options.length > 0 ? meal.options[0].label : "";
          next.set(key, { date: dateStr, mealType: type, selectedOption: defaultOpt });
        }
      });
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
  const progressPercent = Math.min(100, Math.round((totalAmount / prices.minimumBookingAmount) * 100));
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

  const filteredDays = activeDayFilter === "ALL"
    ? days
    : days.filter((d) => d.dayOfWeek.toUpperCase() === activeDayFilter);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Weekly Meal Booking
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Choose meals for the upcoming week. Minimum threshold is ₹{prices.minimumBookingAmount}.
          </p>
        </div>

        {/* Cycle selector dropdown */}
        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <span className="text-xs font-semibold px-2" style={{ color: 'var(--text-muted)' }}>
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
            {weeks.map((w) => (
              <option key={w._id} value={w._id}>
                {formatDate(w.startDate)} – {formatDate(w.endDate)} ({w.status})
              </option>
            ))}
          </select>
          {isOpen ? (
            <Badge variant="success">Open</Badge>
          ) : (
            <Badge variant="warning">Closed</Badge>
          )}
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm font-medium flex items-center justify-between"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          <span>✕ {error}</span>
          <button onClick={() => setError(null)} className="font-bold text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {successCode && (
        <div
          className="rounded-2xl p-6 text-center space-y-4 shadow-sm"
          style={{ background: 'var(--success-bg)', border: '1.5px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          <div className="text-4xl">🎉</div>
          <div>
            <h2 className="text-xl font-black">Booking Request Submitted!</h2>
            <p className="text-sm mt-1 opacity-90">
              Your Booking Code is:{" "}
              <span
                className="font-mono font-black px-3 py-1 rounded-lg text-base inline-block ml-1"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--success-border)', color: 'var(--text-primary)' }}
              >
                {successCode}
              </span>
            </p>
          </div>
          <p className="text-xs max-w-lg mx-auto opacity-80">
            Please visit the mess administration counter to pay the cash amount. Your digital coupons and 5-digit attendance codes will activate once verified by the admin.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button size="sm" onClick={() => router.push("/student/history")}>
              View Booking History →
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSuccessCode(null)}>
              Book Another Meal
            </Button>
          </div>
        </div>
      )}

      {/* Summary & Progress Bar */}
      <div
        className="p-4 md:p-5 rounded-2xl shadow-sm transition-all"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-brand)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Selections
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {totalMeals}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>meals</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <span className="px-1.5 py-0.5 rounded" style={{ background: '#C48CB322', color: 'var(--text-primary)' }}>B:{breakfastCount}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ background: '#83A6CE22', color: 'var(--text-primary)' }}>L:{lunchCount}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ background: '#26415E22', color: 'var(--text-primary)' }}>D:{dinnerCount}</span>
              </div>
            </div>

            <div className="h-10 w-px hidden sm:block" style={{ background: 'var(--border-default)' }} />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Total Cost
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black" style={{ color: 'var(--brand-blue)' }}>
                  ₹{totalAmount}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  / min ₹{prices.minimumBookingAmount}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-36 sm:w-44 h-2 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--bg-muted)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: isMinimumMet
                      ? 'linear-gradient(90deg, #059669, #10B981)'
                      : 'linear-gradient(90deg, #83A6CE, #C48CB3)'
                  }}
                />
              </div>
            </div>

            <div>
              {isMinimumMet ? (
                <Badge variant="success">✓ Min Threshold Met</Badge>
              ) : (
                <Badge variant="warning">
                  Add ₹{prices.minimumBookingAmount - totalAmount} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="lg"
              onClick={handleSubmitBooking}
              disabled={!isOpen || !isMinimumMet || totalMeals === 0}
              isLoading={submitting}
              className="w-full sm:w-auto font-black shadow-lg"
            >
              Submit Booking (₹{totalAmount}) →
            </Button>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-muted)' }}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Quick Select:</span>
            <button
              type="button"
              onClick={() => selectAllOfType("LUNCH")}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              + All Lunches
            </button>
            <button
              type="button"
              onClick={() => selectAllOfType("DINNER")}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              + All Dinners
            </button>
            <button
              type="button"
              onClick={() => selectAllOfType("BREAKFAST")}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              + All Breakfasts
            </button>
          </div>
          {totalMeals > 0 && (
            <button
              type="button"
              onClick={() => setSelectedMeals(new Map())}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--danger-text)' }}
            >
              Clear selections
            </button>
          )}
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveDayFilter("ALL")}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
          style={activeDayFilter === "ALL" ? {
            background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(13,30,76,0.25)',
          } : {
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          All Days ({days.length})
        </button>
        {days.map((day) => {
          const dateStr = new Date(day.date).toISOString().split("T")[0];
          // Count how many meals booked for this day
          let dayMealCount = 0;
          ["BREAKFAST", "LUNCH", "DINNER"].forEach((m) => {
            if (selectedMeals.has(`${dateStr}_${m}`)) dayMealCount++;
          });

          const isActive = activeDayFilter === day.dayOfWeek.toUpperCase();

          return (
            <button
              key={day.dayOfWeek}
              type="button"
              onClick={() => setActiveDayFilter(day.dayOfWeek.toUpperCase())}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5"
              style={isActive ? {
                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(13,30,76,0.25)',
              } : {
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span>{day.dayOfWeek}</span>
              {dayMealCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={isActive ? { background: '#FFFFFF', color: 'var(--brand-navy)' } : { background: 'var(--brand-blue)', color: '#FFFFFF' }}
                >
                  {dayMealCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Meal Grids */}
      {loading ? (
        <div className="p-16 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading menu for booking cycle...
        </div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center" style={{ color: 'var(--text-muted)' }}>
            No menu available for booking in this week. Please check back later or choose another cycle.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredDays.map((day) => {
            const dateStr = new Date(day.date).toISOString().split("T")[0];

            return (
              <div
                key={day.dayOfWeek}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {/* Day Header Bar */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border-muted)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>
                      {day.dayOfWeek}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      {formatDate(day.date)}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    3 Meals Scheduled
                  </span>
                </div>

                {/* 3 Meals Grid */}
                <div className="p-5 grid gap-4 md:grid-cols-3">
                  {day.meals.map((meal) => {
                    const key = `${dateStr}_${meal.mealType}`;
                    const isSelected = selectedMeals.has(key);
                    const selectedData = selectedMeals.get(key);

                    let price = prices.breakfastPrice;
                    let mealAccent = '#C48CB3'; // warm rose
                    let mealIcon = '🌅';
                    if (meal.mealType === "LUNCH") {
                      price = prices.lunchPrice;
                      mealAccent = '#83A6CE'; // steel blue
                      mealIcon = '☀️';
                    }
                    if (meal.mealType === "DINNER") {
                      price = prices.dinnerPrice;
                      mealAccent = '#26415E'; // slate navy
                      mealIcon = '🌙';
                    }

                    const defaultOpt = meal.options && meal.options.length > 0 ? meal.options[0].label : "";

                    return (
                      <div
                        key={meal.mealType}
                        className="rounded-xl p-4 transition-all flex flex-col justify-between"
                        style={!meal.isAvailable ? {
                          background: 'var(--bg-muted)',
                          opacity: 0.6,
                          border: '1px dashed var(--border-default)',
                        } : isSelected ? {
                          background: 'var(--bg-elevated)',
                          border: `2px solid ${mealAccent}`,
                          boxShadow: `0 4px 16px ${mealAccent}25`,
                        } : {
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <div>
                          {/* Top Row: Type & Price */}
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"
                              style={{ background: `${mealAccent}20`, color: mealAccent }}
                            >
                              <span>{mealIcon}</span>
                              {meal.mealType}
                            </span>
                            <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                              ₹{price}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs leading-relaxed min-h-[2.5rem] mt-2" style={{ color: 'var(--text-secondary)' }}>
                            {meal.description || "Regular scheduled mess menu"}
                          </p>

                          {/* Dietary Options / Alternatives */}
                          {meal.options && meal.options.length > 0 && isSelected && (
                            <div
                              className="mt-3 pt-3 rounded-lg p-2.5 space-y-1.5"
                              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-muted)' }}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                                Selected Option:
                              </span>
                              {meal.options.map((opt) => (
                                <label
                                  key={opt.label}
                                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  <input
                                    type="radio"
                                    name={`option_${key}`}
                                    value={opt.label}
                                    checked={selectedData?.selectedOption === opt.label}
                                    onChange={() => handleOptionChange(dateStr, meal.mealType, opt.label)}
                                    className="accent-[#83A6CE]"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Select Button */}
                        <div className="pt-4 mt-3 border-t" style={{ borderColor: 'var(--border-muted)' }}>
                          {meal.isAvailable ? (
                            <button
                              type="button"
                              onClick={() => toggleMeal(dateStr, meal.mealType, defaultOpt)}
                              className="w-full py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5"
                              style={isSelected ? {
                                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                                color: '#FFFFFF',
                                boxShadow: '0 2px 8px rgba(13,30,76,0.2)',
                              } : {
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-default)',
                              }}
                            >
                              {isSelected ? (
                                <>
                                  <span>✓</span>
                                  <span>Selected (₹{price})</span>
                                </>
                              ) : (
                                <>
                                  <span>+</span>
                                  <span>Add to Tray</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="text-center text-xs py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                              Not Available
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
