"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { DEFAULT_PRICES } from "@/types";

interface WeekItem {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function AdminPricesPage() {
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Price state
  const [breakfastPrice, setBreakfastPrice] = useState<number>(DEFAULT_PRICES.breakfast);
  const [lunchPrice, setLunchPrice] = useState<number>(DEFAULT_PRICES.lunch);
  const [dinnerPrice, setDinnerPrice] = useState<number>(DEFAULT_PRICES.dinner);
  const [minimumBookingAmount, setMinimumBookingAmount] = useState<number>(DEFAULT_PRICES.minimumBookingAmount);

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

  useEffect(() => {
    if (!selectedWeekId) return;
    async function loadPrices() {
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch(`/api/prices/${selectedWeekId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBreakfastPrice(data.data.breakfastPrice ?? DEFAULT_PRICES.breakfast);
          setLunchPrice(data.data.lunchPrice ?? DEFAULT_PRICES.lunch);
          setDinnerPrice(data.data.dinnerPrice ?? DEFAULT_PRICES.dinner);
          setMinimumBookingAmount(data.data.minimumBookingAmount ?? DEFAULT_PRICES.minimumBookingAmount);
        }
      } catch {
        setError("Failed to fetch prices for selected week");
      }
    }
    loadPrices();
  }, [selectedWeekId]);

  async function handleSavePrices(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWeekId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/prices/${selectedWeekId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          breakfastPrice: Number(breakfastPrice),
          lunchPrice: Number(lunchPrice),
          dinnerPrice: Number(dinnerPrice),
          minimumBookingAmount: Number(minimumBookingAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update prices");
      } else {
        setSuccess("Prices and minimum booking amount saved successfully!");
      }
    } catch {
      setError("Network error saving prices");
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefaults() {
    setBreakfastPrice(DEFAULT_PRICES.breakfast);
    setLunchPrice(DEFAULT_PRICES.lunch);
    setDinnerPrice(DEFAULT_PRICES.dinner);
    setMinimumBookingAmount(DEFAULT_PRICES.minimumBookingAmount);
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        Loading pricing configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Meal Rates & Booking Thresholds
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure per-meal prices and minimum required booking amounts. Existing bookings keep their original snapshot.
        </p>
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

      {weeks.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Please create an operating cycle first in the Weekly Cycles page.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Configure Cycle Prices</CardTitle>
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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePrices} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <Input
                  label="Breakfast Rate (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={breakfastPrice}
                  onChange={(e) => setBreakfastPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Lunch Rate (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={lunchPrice}
                  onChange={(e) => setLunchPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Dinner Rate (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={dinnerPrice}
                  onChange={(e) => setDinnerPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-brand)' }}
              >
                <Input
                  label="Minimum Booking Threshold (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={minimumBookingAmount}
                  onChange={(e) => setMinimumBookingAmount(Number(e.target.value))}
                  required
                />
                <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Policy requirement: Students must reserve meals summing to at least this amount per cycle (default ₹300).
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-muted)' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetDefaults}
                >
                  Reset Defaults
                </Button>
                <Button type="submit" isLoading={saving} className="font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
