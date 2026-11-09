"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

interface StudentInfo {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
}

interface WeekInfo {
  _id: string;
  startDate: string;
  endDate: string;
}

interface AdminBooking {
  _id: string;
  bookingCode: string;
  totalAmount: number;
  totalMeals: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  paymentStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  submittedAt: string;
  rejectionReason?: string;
  studentId: StudentInfo;
  weekId: WeekInfo;
}

interface BookingItemDetail {
  _id: string;
  date: string;
  mealType: string;
  selectedOption?: string;
  mealDescriptionSnapshot: string;
  priceAtBooking: number;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reject modal state
  const [rejectingBooking, setRejectingBooking] = useState<AdminBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Details modal state
  const [viewingBooking, setViewingBooking] = useState<AdminBooking | null>(null);
  const [items, setItems] = useState<BookingItemDetail[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch {
      setError("Network error fetching bookings");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleApprove(bookingId: string) {
    if (!confirm("Confirm that cash has been physically received at the counter? This will issue coupons.")) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Booking ${data.data.booking.bookingCode} approved! ${data.data.couponsCreated} coupons generated.`);
        fetchBookings();
      } else {
        setError(data.error || "Approval failed");
      }
    } catch {
      setError("Network error approving booking");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingBooking) return;
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${rejectingBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Booking ${rejectingBooking.bookingCode} was rejected.`);
        setRejectingBooking(null);
        setRejectionReason("");
        fetchBookings();
      } else {
        setError(data.error || "Rejection failed");
      }
    } catch {
      setError("Network error rejecting booking");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleViewDetails(booking: AdminBooking) {
    setViewingBooking(booking);
    setLoadingItems(true);
    setItems([]);
    try {
      const res = await fetch(`/api/admin/bookings/${booking._id}`);
      const data = await res.json();
      if (data.success && data.data?.items) {
        setItems(data.data.items);
      }
    } catch {
      console.error("Failed to load details");
    } finally {
      setLoadingItems(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💵</span>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Physical Cash & Booking Approvals
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Review pending student meal orders, verify physical cash deposit at the desk, and issue coupons.
        </p>
      </div>

      {success && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          ✓ {success}
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          ✕ {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={statusFilter === st ? {
                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                color: '#FFFFFF',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search student or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bookings ({bookings.length})</CardTitle>
            <Button size="sm" variant="secondary" onClick={fetchBookings}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No bookings matched the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                <thead
                  className="text-xs uppercase font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-muted)' }}
                >
                  <tr>
                    <th className="px-6 py-3.5">Booking Ref</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Cycle</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-mono font-bold" style={{ color: 'var(--brand-blue)' }}>
                        {b.bookingCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {b.studentId?.name || "Student"}
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {b.studentId?.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {b.weekId ? `${formatDate(b.weekId.startDate)} – ${formatDate(b.weekId.endDate)}` : "Week"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                          ₹{b.totalAmount}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {b.totalMeals} meals
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(b.status)}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(b.paymentStatus)}>
                          {b.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDetails(b)}
                          >
                            Items
                          </Button>
                          {b.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(b._id)}
                                disabled={actionLoading}
                              >
                                ✓ Collect & Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setRejectingBooking(b)}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </>
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

      {/* Reject Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              Reject Booking ({rejectingBooking.bookingCode})
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Provide a clear reason for rejecting this booking (e.g. incorrect payment amount).
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                required
                className="w-full rounded-xl p-3 text-xs outline-none transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRejectingBooking(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" isLoading={actionLoading}>
                  Confirm Reject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Items Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div
            className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-muted)' }}>
              <div>
                <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                  Booking Items ({viewingBooking.bookingCode})
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Student: {viewingBooking.studentId?.name} ({viewingBooking.studentId?.rollNumber})
                </p>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingItems ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Loading meal items...
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No items found
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {items.map((item) => (
                    <div key={item._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: '#83A6CE20', color: 'var(--brand-blue)' }}>
                            {item.mealType}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                            • {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                          {item.mealDescriptionSnapshot}
                        </p>
                        {item.selectedOption && (
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-muted)' }}
                          >
                            Choice: {item.selectedOption}
                          </span>
                        )}
                      </div>
                      <span className="font-black text-sm ml-4" style={{ color: 'var(--text-primary)' }}>
                        ₹{item.priceAtBooking}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-muted)' }}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Total Collected
                </span>
                <div className="text-xl font-black" style={{ color: 'var(--brand-blue)' }}>
                  ₹{viewingBooking.totalAmount}
                </div>
              </div>
              <Button onClick={() => setViewingBooking(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
