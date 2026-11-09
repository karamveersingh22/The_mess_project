"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

  // Fetch stats and recent redemptions
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
    // Refocus input
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
        // Reload recent logs and stats
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Counter & Meal Verifier</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Mess distribution gate: Type student&apos;s 5-digit coupon code to confirm entitlement and record attendance.
          </p>
        </div>

        {/* Meal Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
          {["ALL", "BREAKFAST", "LUNCH", "DINNER"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMeal(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedMeal === m
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
            Expected Today
          </span>
          <span className="text-3xl font-extrabold text-gray-900 mt-1 block">
            {initialLoading ? "..." : stats.expected}
          </span>
          <span className="text-[11px] text-gray-400">Total bookings</span>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide block">
            Meals Served
          </span>
          <span className="text-3xl font-extrabold text-green-800 mt-1 block">
            {initialLoading ? "..." : stats.served}
          </span>
          <span className="text-[11px] text-green-600 font-medium">Checked in</span>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block">
            Remaining
          </span>
          <span className="text-3xl font-extrabold text-amber-800 mt-1 block">
            {initialLoading ? "..." : stats.remaining}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Plates left</span>
        </div>
      </div>

      {/* Main Verification Input Console */}
      <Card className="border-2 border-blue-900 shadow-lg overflow-hidden">
        <div className="bg-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔢</span>
            <span className="font-bold text-sm tracking-wide uppercase">
              Enter Student 5-Digit Code
            </span>
          </div>
          <span className="text-xs bg-blue-800 text-blue-200 px-3 py-1 rounded-full font-mono">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="max-w-md mx-auto">
              <label htmlFor="counter-code-input" className="block text-center text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
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
                  className="w-full text-center text-4xl sm:text-5xl font-mono font-black tracking-[0.5em] py-4 px-6 rounded-2xl border-2 border-blue-900 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300 bg-gray-50/50"
                  autoComplete="off"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCode("");
                    setErrorMessage(null);
                    setSuccessInfo(null);
                    inputRef.current?.focus();
                  }}
                  className="w-1/3 text-gray-600"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={loading || code.length !== 5}
                  className="w-2/3 text-base font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-md disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Verify & Mark Attendance →"}
                </Button>
              </div>
            </div>
          </form>

          {/* SUCCESS BANNER */}
          {successInfo && (
            <div className="rounded-2xl bg-green-50 border-2 border-green-500 p-6 text-green-950 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-black shrink-0">
                  ✓
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold tracking-wider bg-green-200 text-green-900 px-2.5 py-0.5 rounded-full">
                      Attendance Recorded
                    </span>
                    <span className="font-mono text-xs text-green-700">
                      Code: {successInfo.verificationCode}
                    </span>
                  </div>

                  <div className="text-xl font-black text-green-950">
                    {successInfo.studentName}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-green-200">
                    <div>
                      <span className="text-green-700 font-semibold">Roll Number: </span>
                      <span className="font-bold font-mono">{successInfo.rollNumber}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-semibold">Meal Type: </span>
                      <span className="font-bold">{successInfo.mealType}</span>
                    </div>
                    <div className="col-span-2 text-green-800">
                      <span className="font-semibold">Menu: </span>
                      {successInfo.mealDescription}
                    </div>
                  </div>

                  <div className="text-[11px] text-green-600 italic pt-1">
                    Marked at {new Date(successInfo.redeemedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ERROR BANNER */}
          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border-2 border-red-500 p-6 text-red-950 animate-in fade-in duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-black shrink-0">
                  ✕
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-red-700 mb-1">
                    Verification Rejected
                  </div>
                  <div className="text-base font-bold text-red-900 leading-snug">
                    {errorMessage}
                  </div>
                  <p className="text-xs text-red-700 mt-2">
                    Please confirm the 5-digit code on the student&apos;s phone screen and ensure they are scheduled for today&apos;s meal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Redemptions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> Today&apos;s Checked-in Students ({recentRedemptions.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={loadCounterData} className="text-xs">
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentRedemptions.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No students checked in yet today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-y">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Roll No</th>
                    <th className="px-6 py-3">Meal</th>
                    <th className="px-6 py-3">5-Digit Code</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRedemptions.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {r.redeemedAt
                          ? new Date(r.redeemedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Today"}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        {r.studentId?.name || "Student"}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">
                        {r.studentId?.rollNumber || "—"}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-xs text-blue-900">
                          {r.mealType}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono font-bold text-amber-900 text-xs">
                        {r.verificationCode}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="success">REDEEMED</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

