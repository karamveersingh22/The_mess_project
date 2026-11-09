"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
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
  const [activeDayTab, setActiveDayTab] = useState<string>("ALL");
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

  const displayedDays = activeDayTab === "ALL"
    ? days
    : days.filter((d) => d.dayOfWeek.toUpperCase() === activeDayTab);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Weekly Mess Menu
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Explore scheduled daily meals, specials, and pricing for this week.
          </p>
        </div>
        {activeWeek?.status === "OPEN" && (
          <Link href="/student/booking">
            <Button size="lg" className="font-bold shadow-md">
              🍽️ Book Meals for This Week →
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          {error}
        </div>
      )}

      {/* Week Selector & Rate Banner */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Select Cycle:
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
        </div>

        {/* Price tags */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-lg" style={{ background: '#C48CB320', color: 'var(--text-primary)' }}>
            Breakfast: ₹{prices.breakfastPrice}
          </span>
          <span className="px-2.5 py-1 rounded-lg" style={{ background: '#83A6CE20', color: 'var(--text-primary)' }}>
            Lunch: ₹{prices.lunchPrice}
          </span>
          <span className="px-2.5 py-1 rounded-lg" style={{ background: '#26415E20', color: 'var(--text-primary)' }}>
            Dinner: ₹{prices.dinnerPrice}
          </span>
          <span className="px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Min: ₹{prices.minimumBookingAmount}
          </span>
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveDayTab("ALL")}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
          style={activeDayTab === "ALL" ? {
            background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(13,30,76,0.25)',
          } : {
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          Entire Week
        </button>
        {days.map((day) => {
          const isActive = activeDayTab === day.dayOfWeek.toUpperCase();
          return (
            <button
              key={day.dayOfWeek}
              type="button"
              onClick={() => setActiveDayTab(day.dayOfWeek.toUpperCase())}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
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
              {day.dayOfWeek}
            </button>
          );
        })}
      </div>

      {/* Menu Cards */}
      {loading ? (
        <div className="p-16 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading menu details...
        </div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center" style={{ color: 'var(--text-muted)' }}>
            No menu configured for this week yet. Please check back soon or choose another week.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedDays.map((day) => (
            <div
              key={day.dayOfWeek}
              className="rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              {/* Day Header */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                  color: '#FFFFFF',
                }}
              >
                <span className="font-extrabold text-sm">{day.dayOfWeek}</span>
                <span className="text-xs opacity-80">{formatDate(day.date)}</span>
              </div>

              {/* Day Meals Content */}
              <div className="p-5 space-y-4 flex-1">
                {day.meals.map((meal) => {
                  let price = prices.breakfastPrice;
                  let badgeAccent = '#C48CB3';
                  let icon = '🌅';
                  if (meal.mealType === "LUNCH") {
                    price = prices.lunchPrice;
                    badgeAccent = '#83A6CE';
                    icon = '☀️';
                  }
                  if (meal.mealType === "DINNER") {
                    price = prices.dinnerPrice;
                    badgeAccent = '#26415E';
                    icon = '🌙';
                  }

                  return (
                    <div
                      key={meal.mealType}
                      className="pb-3.5 border-b last:border-0 last:pb-0"
                      style={{ borderColor: 'var(--border-muted)' }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{ background: `${badgeAccent}20`, color: badgeAccent }}
                        >
                          <span>{icon}</span>
                          {meal.mealType}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                            ₹{price}
                          </span>
                          {!meal.isAvailable && (
                            <Badge variant="danger">Unavailable</Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {meal.description || "Regular meal offering"}
                      </p>

                      {/* Options / choices */}
                      {meal.options && meal.options.length > 0 && (
                        <div
                          className="mt-2.5 rounded-lg p-2.5"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)' }}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Special Choices:
                          </span>
                          <ul className="text-xs space-y-1" style={{ color: 'var(--text-primary)' }}>
                            {meal.options.map((opt, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span style={{ color: 'var(--brand-blue)' }}>•</span>
                                <span className="font-semibold">{opt.label}</span>
                                {opt.description && (
                                  <span style={{ color: 'var(--text-muted)' }}>— {opt.description}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Card Footer action */}
              {activeWeek?.status === "OPEN" && (
                <div
                  className="px-5 py-3 border-t text-right"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-muted)' }}
                >
                  <Link
                    href="/student/booking"
                    className="text-xs font-bold inline-flex items-center gap-1 hover:underline"
                    style={{ color: 'var(--brand-blue)' }}
                  >
                    Select for this day →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
