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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Booking History</h1>
          <p className="text-sm text-gray-600">
            View your past weekly bookings, payment status, and admin approval records.
          </p>
        </div>
        <Link href="/student/booking">
          <Button>+ New Meal Booking</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submitted Weekly Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your history...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <p>You haven&apos;t made any meal bookings yet.</p>
              <Link href="/student/booking">
                <Button size="sm">Book Meals for This Week</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">Booking Code</th>
                    <th className="px-6 py-3">Week Dates</th>
                    <th className="px-6 py-3">Meals</th>
                    <th className="px-6 py-3">Total Amount</th>
                    <th className="px-6 py-3">Booking Status</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-bold text-blue-900">
                        {b.bookingCode}
                      </td>
                      <td className="px-6 py-4">
                        {b.weekId ? (
                          <span>
                            {formatDate(b.weekId.startDate)} – {formatDate(b.weekId.endDate)}
                          </span>
                        ) : (
                          "Cycle"
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{b.totalMeals} meals</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
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
                                Coupons
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Booking Details ({selectedBooking.bookingCode})
                </h2>
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(selectedBooking.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {selectedBooking.status === "REJECTED" && selectedBooking.rejectionReason && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 border border-red-200">
                <span className="text-xs font-bold text-red-900 block">
                  Rejection Reason:
                </span>
                <p className="text-sm text-red-700">
                  {selectedBooking.rejectionReason}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              {loadingDetails ? (
                <div className="p-8 text-center text-gray-500">Loading meal items...</div>
              ) : bookingItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No items found</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookingItems.map((item) => (
                    <div key={item._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-blue-900">
                            {item.mealType}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {item.mealDescriptionSnapshot}
                        </p>
                        {item.selectedOption && (
                          <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                            Choice: {item.selectedOption}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-gray-900 ml-4">
                        ₹{item.priceAtBooking}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">Total Price at Booking</span>
                <div className="text-xl font-black text-blue-900">
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

