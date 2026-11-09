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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Menu Editor</h1>
          <p className="text-sm text-gray-600">
            Customize daily meals, specify alternatives (e.g., Chicken / Paneer), and toggle item availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSeedDefault} isLoading={seeding}>
            Load Standard Menu
          </Button>
          <Button onClick={handleSaveMenu} isLoading={saving}>
            Save All Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          {success}
        </div>
      )}

      {weeks.length > 0 && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Week Cycle:</span>
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
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading menu data...</div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No menu found for this week. Click &quot;Load Standard Menu&quot; to initialize with the college mess template.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card key={day.dayOfWeek} className="overflow-hidden">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-base text-blue-900 font-bold">
                  {day.dayOfWeek} ({formatDate(day.date)})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {day.meals.map((meal, mealIndex) => (
                  <div
                    key={meal.mealType}
                    className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">
                        {meal.mealType}
                      </span>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={meal.isAvailable}
                          onChange={(e) =>
                            handleMealChange(dayIndex, mealIndex, "isAvailable", e.target.checked)
                          }
                          className="rounded text-blue-900 focus:ring-blue-500"
                        />
                        Available for booking
                      </label>
                    </div>

                    <Input
                      label="Meal Description / Food Items"
                      value={meal.description}
                      onChange={(e) =>
                        handleMealChange(dayIndex, mealIndex, "description", e.target.value)
                      }
                      placeholder="e.g. Dal Makhani, Rice, Roti, Gulab Jamun"
                    />

                    {/* Alternatives / Options */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Alternatives / Choices ({meal.options?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(dayIndex, mealIndex)}
                          className="text-xs text-blue-900 hover:underline font-medium"
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
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Brief description"
                            value={opt.description}
                            onChange={(e) =>
                              handleOptionChange(dayIndex, mealIndex, optIndex, "description", e.target.value)
                            }
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(dayIndex, mealIndex, optIndex)}
                            className="text-red-600 hover:text-red-800 text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

