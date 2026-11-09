"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

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

export default function AdminMenuPage() {
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [days, setDays] = useState<DayMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeeks() {
      try {
        const res = await fetch("/api/weeks");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setWeeks(data.data);
          setSelectedWeekId(data.data[0]._id);
        }
      } catch {
        setError("Failed to load weekly cycles");
      } finally {
        setLoading(false);
      }
    }
    loadWeeks();
  }, []);

  async function loadMenu(weekId: string) {
    if (!weekId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/menu/${weekId}`);
      const data = await res.json();
      if (data.success && data.data?.days) {
        setDays(data.data.days);
      } else {
        setDays([]);
      }
    } catch {
      setError("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedWeekId) {
      loadMenu(selectedWeekId);
    }
  }, [selectedWeekId]);

  function handleMealChange(
    dayIndex: number,
    mealIndex: number,
    field: keyof MealItem,
    value: unknown
  ) {
    setDays((prev) => {
      const newDays = [...prev];
      const targetMeal = { ...newDays[dayIndex].meals[mealIndex], [field]: value };
      newDays[dayIndex].meals[mealIndex] = targetMeal;
      return newDays;
    });
  }

  function handleAddOption(dayIndex: number, mealIndex: number) {
    setDays((prev) => {
      const newDays = [...prev];
      const meal = newDays[dayIndex].meals[mealIndex];
      meal.options = [...(meal.options || []), { label: "Alternative", description: "" }];
      return newDays;
    });
  }

  function handleRemoveOption(dayIndex: number, mealIndex: number, optIndex: number) {
    setDays((prev) => {
      const newDays = [...prev];
      const meal = newDays[dayIndex].meals[mealIndex];
      meal.options = meal.options.filter((_, idx) => idx !== optIndex);
      return newDays;
    });
  }

  function handleOptionChange(
    dayIndex: number,
    mealIndex: number,
    optIndex: number,
    field: "label" | "description",
    value: string
  ) {
    setDays((prev) => {
      const newDays = [...prev];
      const options = [...newDays[dayIndex].meals[mealIndex].options];
      options[optIndex] = { ...options[optIndex], [field]: value };
      newDays[dayIndex].meals[mealIndex].options = options;
      return newDays;
    });
  }

  async function handleSaveMenu() {
    if (!selectedWeekId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/menu/${selectedWeekId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save menu");
      } else {
        setSuccess("Weekly menu updated successfully!");
      }
    } catch {
      setError("Network error saving menu");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDefault() {
    if (!selectedWeekId) return;
    setSeeding(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/menu/${selectedWeekId}/seed`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Standard college mess menu loaded!");
        loadMenu(selectedWeekId);
      } else {
        setError(data.error || "Failed to seed menu");
      }
    } catch {
      setError("Network error seeding menu");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Weekly Menu Builder
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure daily menu dishes, dietary alternatives (e.g. Chicken / Paneer), and item availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSeedDefault} isLoading={seeding}>
            Load Standard Menu
          </Button>
          <Button onClick={handleSaveMenu} isLoading={saving} className="font-bold">
            Save All Changes
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          ✕ {error}
        </div>
      )}

      {success && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          ✓ {success}
        </div>
      )}

      {weeks.length > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Operating Cycle:
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
      )}

      {loading ? (
        <div className="p-16 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading menu data...
        </div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No menu found for this week. Click &quot;Load Standard Menu&quot; to initialize with the college mess template.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <div
              key={day.dayOfWeek}
              className="rounded-2xl overflow-hidden shadow-sm transition-all"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
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

              <div className="p-5 space-y-4">
                {day.meals.map((meal, mealIndex) => (
                  <div
                    key={meal.mealType}
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                        {meal.mealType}
                      </span>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={meal.isAvailable}
                          onChange={(e) =>
                            handleMealChange(dayIndex, mealIndex, "isAvailable", e.target.checked)
                          }
                          className="accent-[#83A6CE]"
                        />
                        Available for booking
                      </label>
                    </div>

                    <Input
                      label="Meal Description / Dishes"
                      value={meal.description}
                      onChange={(e) =>
                        handleMealChange(dayIndex, mealIndex, "description", e.target.value)
                      }
                      placeholder="e.g. Dal Makhani, Steamed Rice, Butter Roti, Gulab Jamun"
                    />

                    {/* Alternatives / Options */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          Options & Dietary Alternatives ({meal.options?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(dayIndex, mealIndex)}
                          className="text-xs font-bold hover:underline"
                          style={{ color: 'var(--brand-blue)' }}
                        >
                          + Add Choice (e.g. Chicken / Paneer)
                        </button>
                      </div>

                      {meal.options && meal.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Option label (e.g. Butter Chicken)"
                            value={opt.label}
                            onChange={(e) =>
                              handleOptionChange(dayIndex, mealIndex, optIndex, "label", e.target.value)
                            }
                            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Brief description"
                            value={opt.description}
                            onChange={(e) =>
                              handleOptionChange(dayIndex, mealIndex, optIndex, "description", e.target.value)
                            }
                            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(dayIndex, mealIndex, optIndex)}
                            className="text-xs px-2 font-bold opacity-70 hover:opacity-100"
                            style={{ color: 'var(--danger-text)' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
