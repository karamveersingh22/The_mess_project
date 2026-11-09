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
    if (!confirm("Confirm physical cash payment has been received and approve this booking?")) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Payment verified and booking approved!");
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
    if (!rejectingBooking || !rejectionReason.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/bookings/${rejectingBooking._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Booking request rejected");
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

  async function handleViewDetails(b: AdminBooking) {
    setViewingBooking(b);
    setLoadingItems(true);
    setItems([]);
    try {
      const res = await fetch(`/api/bookings/${b._id}`);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Booking Requests & Verification</h1>
        <p className="text-sm text-gray-600">
          Review student meal requests, verify physical cash payments, and issue digital coupons through approval.
        </p>
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No booking requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Booking Code</th>
                    <th className="px-6 py-3">Week</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Submitted</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{b.studentId?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {b.studentId?.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-900">
                        {b.bookingCode}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {b.weekId ? (
                          <span>{formatDate(b.weekId.startDate)} – {formatDate(b.weekId.endDate)}</span>
                        ) : (
                          "Cycle"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-gray-900">₹{b.totalAmount}</div>
                        <div className="text-xs text-gray-400">{b.totalMeals} meals</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(b.status)}>{b.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(b.paymentStatus)}>
                          {b.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(b.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDetails(b)}
                          >
                            View
                          </Button>

                          {b.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(b._id)}
                                isLoading={actionLoading}
                              >
                                Verify & Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setRejectingBooking(b);
                                  setRejectionReason("");
                                }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Reject Booking ({rejectingBooking.bookingCode})
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Student: {rejectingBooking.studentId?.name} ({rejectingBooking.studentId?.rollNumber})
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Payment not received, incorrect cash amount..."
                  required
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRejectingBooking(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" isLoading={actionLoading}>
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewingBooking.studentId?.name} — {viewingBooking.bookingCode}
                </h2>
                <p className="text-xs text-gray-500">
                  Roll: {viewingBooking.studentId?.rollNumber} | Total: ₹{viewingBooking.totalAmount} ({viewingBooking.totalMeals} meals)
                </p>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingItems ? (
                <div className="p-8 text-center text-gray-500">Loading meals...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No meal items recorded</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-blue-900 uppercase mr-2">
                          {item.mealType}
                        </span>
                        <span className="text-gray-500 mr-2">
                          ({formatDate(item.date)})
                        </span>
                        <span className="text-gray-800">{item.mealDescriptionSnapshot}</span>
                        {item.selectedOption && (
                          <span className="ml-2 font-medium text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Choice: {item.selectedOption}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 ml-4">
                        ₹{item.priceAtBooking}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button onClick={() => setViewingBooking(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

