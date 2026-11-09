"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Please enter your email/roll number and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }
      const searchParams = new URLSearchParams(window.location.search);
      const callback = searchParams.get("callbackUrl");
      router.push(callback || data.data.redirectUrl || "/student/dashboard");
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(145deg, #0D1E4C 0%, #26415E 60%, #0B1B32 100%)' }}
      >
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>M</div>
          <h1 className="text-3xl font-extrabold text-white mb-3">MessBook</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#83A6CE' }}>
            Your digital mess management platform. Book meals, track coupons, and never miss a meal again.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {([['🍽️', 'Book Meals'], ['🎫', 'Get Coupons'], ['⚡', 'Fast Check-in']] as [string, string][]).map(([icon, label]) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-[11px] font-medium" style={{ color: '#E5C9D7' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)' }}>M</div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>MessBook</span>
            </Link>
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
                {error}
              </div>
            )}
            <Input
              label="Email or Roll Number"
              type="text"
              placeholder="21CS001 or student@college.edu"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--brand-navy)' }}>
                Register here
              </Link>
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Mess Admins can sign in with admin credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
