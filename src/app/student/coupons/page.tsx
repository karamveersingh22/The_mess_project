"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusVariant } from "@/components/ui/Badge";
import { formatDate, isSameDayInAppTZ } from "@/lib/utils";

interface CouponItem {
  _id: string;
  couponCode: string;
  verificationCode?: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mealDescriptionSnapshot: string;
  status: "ACTIVE" | "REDEEMED" | "CANCELLED";
  generatedAt: string;
  redeemedAt?: string;
  bookingId?: {
    bookingCode: string;
  };
  weekId?: {
    startDate: string;
    endDate: string;
  };
}

export default function StudentCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch("/api/coupons");
        const data = await res.json();
        if (data.success) {
          setCoupons(data.data);
        } else {
          setError(data.error || "Failed to load coupons");
        }
      } catch {
        setError("Network error fetching coupons");
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const todayCoupons = coupons.filter((c) => isSameDayInAppTZ(c.date));

  const filteredCoupons = coupons.filter((c) => {
    if (selectedFilter === "ALL") return true;
    return c.mealType === selectedFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Digital Passes & Attendance Codes
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Tell your <strong style={{ color: 'var(--brand-blue)' }}>5-digit code</strong> to the mess staff at the counter to verify your meal.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={selectedFilter === filter ? {
                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                color: '#FFFFFF',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          {error}
        </div>
      )}

      {/* TODAY'S ACTIVE MEAL PASS HIGHLIGHT BANNER */}
      {!loading && todayCoupons.length > 0 && (
        <div
          className="rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D1E4C 0%, #26415E 70%, #0B1B32 100%)',
            border: '1.5px solid #83A6CE44',
          }}
        >
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-pulse">⚡</span>
              <div>
                <h2 className="text-lg font-black text-white">Today&apos;s Active Meal Passes</h2>
                <p className="text-xs" style={{ color: '#83A6CE' }}>
                  {new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            <span
              className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-black shadow-sm"
              style={{ background: '#E5C9D7' }}
            >
              Live For Today
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayCoupons.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl p-4 transition-all flex flex-col justify-between"
                style={c.status === "REDEEMED" ? {
                  background: 'rgba(11, 27, 50, 0.6)',
                  border: '1px solid rgba(131, 166, 206, 0.2)',
                  opacity: 0.8,
                } : {
                  background: 'var(--bg-surface)',
                  border: '2px solid #83A6CE',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={c.status === "REDEEMED"
                        ? { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }
                        : { background: '#83A6CE22', color: 'var(--brand-navy)' }
                      }
                    >
                      {c.mealType}
                    </span>
                    <Badge variant={getStatusVariant(c.status)}>
                      {c.status === "REDEEMED" ? "USED" : "READY TO EAT"}
                    </Badge>
                  </div>

                  {/* 5-Digit Counter Code Showcase */}
                  <div
                    className="text-center my-3 py-3 rounded-xl border border-dashed transition-all"
                    style={{
                      background: c.status === "REDEEMED" ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                      borderColor: c.status === "REDEEMED" ? 'rgba(255,255,255,0.15)' : 'var(--border-default)',
                    }}
                  >
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider block mb-1"
                      style={{ color: c.status === "REDEEMED" ? '#83A6CE' : 'var(--text-muted)' }}
                    >
                      5-Digit Counter Code
                    </span>
                    <div
                      className="font-mono text-3xl font-black tracking-[0.25em]"
                      style={{ color: c.status === "REDEEMED" ? '#FFFFFF' : 'var(--brand-navy)' }}
                    >
                      {c.verificationCode || "N/A"}
                    </div>
                  </div>

                  <p
                    className="text-xs line-clamp-2"
                    style={{ color: c.status === "REDEEMED" ? '#83A6CE' : 'var(--text-secondary)' }}
                  >
                    {c.mealDescriptionSnapshot}
                  </p>
                </div>

                <div
                  className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
                  style={{ borderColor: c.status === "REDEEMED" ? 'rgba(255,255,255,0.1)' : 'var(--border-muted)' }}
                >
                  {c.status === "REDEEMED" ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ Redeemed {c.redeemedAt ? new Date(c.redeemedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) : "Today"}
                    </span>
                  ) : (
                    <span className="font-bold flex items-center gap-1" style={{ color: 'var(--brand-blue)' }}>
                      <span>👉</span> Tell at counter
                    </span>
                  )}
                  <span className="font-mono text-[10px] opacity-60">
                    {c.couponCode.substring(0, 10)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="p-16 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading your coupons...
        </div>
      ) : coupons.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center space-y-4">
            <div className="text-5xl">🎫</div>
            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              No Digital Coupons Yet
            </h3>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Coupons with attendance verification codes will be automatically generated once the mess admin approves your physical payment.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/student/booking">
                <Button size="sm">Book Meals</Button>
              </Link>
              <Link href="/student/history">
                <Button size="sm" variant="outline">
                  Check Booking Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
              All Passes ({filteredCoupons.length})
            </h2>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Tap any pass for details
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl transition-all flex flex-col justify-between overflow-hidden shadow-sm"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {/* Pass Header */}
                <div className="p-5">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border-muted)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🍽️</span>
                      <span className="font-extrabold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                        {c.mealType} PASS
                      </span>
                    </div>
                    <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      Valid On:
                    </span>
                    <div className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(c.date)}
                    </div>
                    <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {c.mealDescriptionSnapshot}
                    </p>
                  </div>

                  {/* 5-Digit Counter Code Badge */}
                  <div
                    className="p-3 rounded-xl border border-dashed text-center mt-3"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-brand)' }}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      Attendance 5-Digit Code
                    </span>
                    <span
                      className="font-mono text-2xl font-black tracking-[0.2em] block my-0.5"
                      style={{ color: 'var(--brand-blue)' }}
                    >
                      {c.verificationCode || "—"}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {c.status === "REDEEMED"
                        ? `Redeemed ${c.redeemedAt ? new Date(c.redeemedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) : ""}`
                        : "Present code at mess counter"}
                    </span>
                  </div>
                </div>

                {/* Perforated Divider & Coupon System ID */}
                <div
                  className="px-5 py-3 border-t border-dashed flex items-center justify-between text-[11px]"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      System ID
                    </span>
                    <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {c.couponCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {c.bookingId?.bookingCode || "BK"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
