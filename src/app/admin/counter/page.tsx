"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CounterStats {
  expected: number;
  served: number;
  remaining: number;
}

interface RecentRedemption {
  _id: string;
  verificationCode: string;
  mealType: string;
  mealDescriptionSnapshot: string;
  redeemedAt: string;
  studentId?: {
    name: string;
    rollNumber: string;
  };
}

interface VerificationSuccess {
  studentName: string;
  rollNumber: string;
  mealType: string;
  mealDescription: string;
  verificationCode: string;
  redeemedAt: string;
}

export default function AdminCounterPage() {
  const [stats, setStats] = useState<CounterStats>({ expected: 0, served: 0, remaining: 0 });
  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("ALL");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [successInfo, setSuccessInfo] = useState<VerificationSuccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect current meal based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setSelectedMeal("BREAKFAST");
    else if (hour < 16) setSelectedMeal("LUNCH");
    else setSelectedMeal("DINNER");
  }, []);

  const loadCounterData = async () => {
    try {
      const res = await fetch(`/api/admin/counter?mealType=${selectedMeal}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setRecentRedemptions(data.data.recentRedemptions || []);
      }
    } catch (err) {
      console.error("Failed to load counter data:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCounterData();
    inputRef.current?.focus();
  }, [selectedMeal]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim();

    if (cleanCode.length !== 5) {
      setErrorMessage("Please enter exactly 5 digits.");
      setSuccessInfo(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const res = await fetch("/api/admin/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationCode: cleanCode }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessInfo(data.data);
        setCode("");
        loadCounterData();
      } else {
        setErrorMessage(data.error || "Verification failed");
      }
    } catch {
      setErrorMessage("Network error occurred during verification.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Attendance Tracker & Meal Gate
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Enter the student&apos;s 5-digit verification code to confirm meal entitlement and record live attendance.
          </p>
        </div>

        {/* Meal Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMeal(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={selectedMeal === m ? {
                background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                color: '#FFFFFF',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 text-center shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Expected Today
          </span>
          <span className="text-3xl font-black mt-1 block" style={{ color: 'var(--text-primary)' }}>
            {initialLoading ? "..." : stats.expected}
          </span>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Total scheduled
          </span>
        </div>

        <div
          className="rounded-2xl p-5 text-center shadow-sm"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Meals Served
          </span>
          <span className="text-3xl font-black mt-1 block">
            {initialLoading ? "..." : stats.served}
          </span>
          <span className="text-[11px] font-bold">Checked in</span>
        </div>

        <div
          className="rounded-2xl p-5 text-center shadow-sm"
          style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning-text)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Remaining
          </span>
          <span className="text-3xl font-black mt-1 block">
            {initialLoading ? "..." : stats.remaining}
          </span>
          <span className="text-[11px] font-bold">Plates left</span>
        </div>
      </div>

      {/* Main Verification Input Console */}
      <div
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-brand)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between text-white"
          style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔢</span>
            <span className="font-black text-sm tracking-wide uppercase">
              Enter Student 5-Digit Code
            </span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="max-w-md mx-auto">
              <label
                htmlFor="counter-code-input"
                className="block text-center text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                5-Digit Code from Student&apos;s Phone
              </label>

              <div className="relative">
                <input
                  id="counter-code-input"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setCode(val);
                    setErrorMessage(null);
                    setSuccessInfo(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="• • • • •"
                  className="w-full text-center text-4xl sm:text-5xl font-mono font-black tracking-[0.4em] py-4 px-6 rounded-2xl outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '2px solid var(--border-brand)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                  autoComplete="off"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCode("");
                    setErrorMessage(null);
                    setSuccessInfo(null);
                    inputRef.current?.focus();
                  }}
                  className="w-1/3 font-bold"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={loading || code.length !== 5}
                  className="w-2/3 text-sm font-black shadow-lg"
                >
                  {loading ? "Checking..." : "Verify & Mark Attendance →"}
                </Button>
              </div>
            </div>
          </form>

          {/* Success Banner */}
          {successInfo && (
            <div
              className="rounded-2xl p-6 text-center space-y-3 animate-fade-in shadow-md"
              style={{ background: 'var(--success-bg)', border: '1.5px solid var(--success-border)', color: 'var(--success-text)' }}
            >
              <div className="text-3xl">✓ Verified & Attendance Marked!</div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">
                  {successInfo.studentName}{" "}
                  <span className="font-mono font-bold text-sm opacity-80">
                    ({successInfo.rollNumber})
                  </span>
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/10">
                  <span>🍽️ {successInfo.mealType} MEAL</span>
                </div>
              </div>
              <p className="text-xs font-medium max-w-md mx-auto opacity-90">
                {successInfo.mealDescription}
              </p>
              <div className="text-[11px] opacity-75 font-mono">
                Code #{successInfo.verificationCode} • Redeemed at {new Date(successInfo.redeemedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="rounded-2xl p-5 text-center space-y-2 animate-shake"
              style={{ background: 'var(--danger-bg)', border: '1.5px solid var(--danger-border)', color: 'var(--danger-text)' }}
            >
              <div className="text-2xl font-black">✕ Verification Rejected</div>
              <p className="text-sm font-semibold max-w-lg mx-auto">
                {errorMessage}
              </p>
              <p className="text-xs opacity-80">
                Please confirm the 5-digit code on the student&apos;s phone screen and ensure they are scheduled for today&apos;s meal.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Log of Recent Redemptions */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border-muted)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              Live Check-in Feed (Today)
            </h3>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Auto-updates after every entry
          </span>
        </div>

        <div className="p-0">
          {recentRedemptions.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              No check-ins logged for this meal session yet.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
              {recentRedemptions.map((item) => (
                <div
                  key={item._id}
                  className="px-6 py-3.5 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-sm font-black px-2.5 py-1 rounded-md"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--brand-blue)' }}
                    >
                      {item.verificationCode}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {item.studentId?.name || "Student"}
                        </span>
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          ({item.studentId?.rollNumber || "N/A"})
                        </span>
                      </div>
                      <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {item.mealDescriptionSnapshot}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="success">SERVED</Badge>
                    <span className="block text-[10px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.redeemedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
