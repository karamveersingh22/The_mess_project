"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface BookingItemSummary {
  _id: string;
  bookingCode: string;
  totalAmount: number;
  totalMeals: number;
  status: string;
  paymentStatus: string;
  submittedAt: string;
  rejectionReason?: string;
  weekId?: {
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface ItemDetail {
  _id: string;
  date: string;
  mealType: string;
  selectedOption?: string;
  mealDescriptionSnapshot: string;
  priceAtBooking: number;
}

export default function StudentBookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected booking for detailed items modal
  const [selectedBooking, setSelectedBooking] = useState<BookingItemSummary | null>(null);
  const [bookingItems, setBookingItems] = useState<ItemDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch("/api/bookings");
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
    }
    loadBookings();
  }, []);

  async function handleOpenDetails(booking: BookingItemSummary) {
    setSelectedBooking(booking);
    setLoadingDetails(true);
    setBookingItems([]);
    try {
      const res = await fetch(`/api/bookings/${booking._id}`);
      const data = await res.json();
      if (data.success && data.data?.items) {
        setBookingItems(data.data.items);
      }
    } catch {
      console.error("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              My Booking History
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Review your weekly meal bookings, cash verification status, and itemized records.
          </p>
        </div>
        <Link href="/student/booking">
          <Button size="md" className="font-bold">
            + New Meal Booking
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submitted Weekly Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Loading your history...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center space-y-4" style={{ color: 'var(--text-muted)' }}>
              <div className="text-4xl">🍽️</div>
              <p className="text-sm font-medium">You haven&apos;t placed any meal bookings yet.</p>
              <Link href="/student/booking">
                <Button size="sm">Book Meals for This Week</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                <thead
                  className="text-xs uppercase font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-muted)' }}
                >
                  <tr>
                    <th className="px-6 py-3.5">Booking Code</th>
                    <th className="px-6 py-3.5">Week Cycle</th>
                    <th className="px-6 py-3.5">Meals</th>
                    <th className="px-6 py-3.5">Total Amount</th>
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
                        {b.weekId ? (
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatDate(b.weekId.startDate)} – {formatDate(b.weekId.endDate)}
                          </span>
                        ) : (
                          "Cycle"
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold">{b.totalMeals} meals</td>
                      <td className="px-6 py-4 font-black" style={{ color: 'var(--text-primary)' }}>
                        ₹{b.totalAmount}
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenDetails(b)}
                          >
                            Details
                          </Button>
                          {b.status === "APPROVED" && (
                            <Link href="/student/coupons">
                              <Button size="sm" variant="success">
                                Passes →
                              </Button>
                            </Link>
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

      {/* Itemized Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div
            className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-muted)' }}>
              <div>
                <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                  Booking Details ({selectedBooking.bookingCode})
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Submitted on {new Date(selectedBooking.submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >
                ✕
              </button>
            </div>

            {selectedBooking.status === "REJECTED" && selectedBooking.rejectionReason && (
              <div
                className="mt-4 rounded-xl p-3 text-xs"
                style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
              >
                <span className="font-bold block mb-0.5">Rejection Reason:</span>
                <p>{selectedBooking.rejectionReason}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              {loadingDetails ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Loading meal items...
                </div>
              ) : bookingItems.length === 0 ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No items found
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {bookingItems.map((item) => (
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
                  Total Paid / Due
                </span>
                <div className="text-xl font-black" style={{ color: 'var(--brand-blue)' }}>
                  ₹{selectedBooking.totalAmount} ({selectedBooking.totalMeals} meals)
                </div>
              </div>
              <Button onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
