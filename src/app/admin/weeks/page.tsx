"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface WeekItem {
  _id: string;
  startDate: string;
  endDate: string;
  bookingStart: string;
  bookingEnd: string;
  status: "UPCOMING" | "OPEN" | "CLOSED";
  createdBy?: { name: string; email: string };
}

export default function AdminWeeksPage() {
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [status, setStatus] = useState<"UPCOMING" | "OPEN" | "CLOSED">("OPEN");
  const [submitting, setSubmitting] = useState(false);

  async function fetchWeeks() {
    setLoading(true);
    try {
      const res = await fetch("/api/weeks");
      const data = await res.json();
      if (data.success) {
        setWeeks(data.data);
      } else {
        setError(data.error || "Failed to load weeks");
      }
    } catch {
      setError("Network error loading weeks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeeks();
  }, []);

  async function handleCreateWeek(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/weeks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          bookingStart,
          bookingEnd,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create week");
        setSubmitting(false);
        return;
      }

      setSuccessMsg("Weekly cycle, prices, and default menu initialized successfully!");
      setShowCreateModal(false);
      setStartDate("");
      setEndDate("");
      setBookingStart("");
      setBookingEnd("");
      fetchWeeks();
    } catch {
      setError("Network error creating week");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(weekId: string, newStatus: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/weeks/${weekId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setWeeks((prev) =>
          prev.map((w) => (w._id === weekId ? { ...w, status: newStatus as WeekItem["status"] } : w))
        );
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch {
      setError("Network error updating status");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Weekly Booking Cycles
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Schedule and control Monday–Sunday operational cycles, booking windows, and automated menu generation.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="font-bold">
          + Create New Cycle
        </Button>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          ✕ {error}
        </div>
      )}

      {successMsg && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Weeks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Operating Cycles ({weeks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Loading weekly cycles...
            </div>
          ) : weeks.length === 0 ? (
            <div className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No weekly cycles created yet. Click &quot;+ Create New Cycle&quot; to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                <thead
                  className="text-xs uppercase font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-muted)' }}
                >
                  <tr>
                    <th className="px-6 py-3.5">Operating Dates (Mon–Sun)</th>
                    <th className="px-6 py-3.5">Booking Window</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {weeks.map((w) => (
                    <tr
                      key={w._id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatDate(w.startDate)} – {formatDate(w.endDate)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Opens: </span>
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(w.bookingStart).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Closes: </span>
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(w.bookingEnd).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(w.status)}>
                          {w.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {w.status !== "OPEN" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusChange(w._id, "OPEN")}
                            >
                              Open
                            </Button>
                          )}
                          {w.status !== "CLOSED" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStatusChange(w._id, "CLOSED")}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Week Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <h2 className="text-lg font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Create Weekly Booking Cycle
            </h2>
            <form onSubmit={handleCreateWeek} className="space-y-4">
              <Input
                label="Mess Week Start Date (Monday)"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="Mess Week End Date (Sunday)"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <Input
                label="Booking Opens At"
                type="datetime-local"
                value={bookingStart}
                onChange={(e) => setBookingStart(e.target.value)}
                required
              />
              <Input
                label="Booking Closes At"
                type="datetime-local"
                value={bookingEnd}
                onChange={(e) => setBookingEnd(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WeekItem["status"])}
                  className="w-full rounded-lg px-3 py-2.5 text-xs font-bold outline-none transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="OPEN">OPEN (Students can book now)</option>
                  <option value="UPCOMING">UPCOMING (Not yet open)</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Initialize Cycle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
