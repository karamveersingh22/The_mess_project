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
      // Reset form
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Booking Cycles</h1>
          <p className="text-sm text-gray-600">
            Create and manage Monday–Sunday meal cycles and open/close student booking windows.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Create New Week Cycle
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Weeks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Weekly Cycles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading weekly cycles...</div>
          ) : weeks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No weekly cycles created yet. Click &quot;Create New Week Cycle&quot; to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">Week Dates (Mon–Sun)</th>
                    <th className="px-6 py-3">Booking Window</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weeks.map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatDate(w.startDate)} – {formatDate(w.endDate)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div><span className="text-gray-400">Open:</span> {new Date(w.bookingStart).toLocaleString()}</div>
                        <div><span className="text-gray-400">Close:</span> {new Date(w.bookingEnd).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(w.status)}>
                          {w.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {w.status !== "OPEN" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusChange(w._id, "OPEN")}
                            >
                              Open Bookings
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WeekItem["status"])}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="OPEN">OPEN (Students can book now)</option>
                  <option value="UPCOMING">UPCOMING (Not yet open)</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Initialize Week
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

