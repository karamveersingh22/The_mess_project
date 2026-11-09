"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    if (formData.password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          rollNumber: formData.rollNumber,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setFieldErrors(data.errors);
        else setGeneralError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      router.push("/student/dashboard");
      router.refresh();
    } catch {
      setGeneralError("A network error occurred. Please try again.");
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
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >M</div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Join MessBook</h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#83A6CE' }}>
            Register as a student to start booking your weekly meals online and get digital coupons.
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: "✓", text: "Book meals for the full week in minutes" },
              { icon: "✓", text: "Track your booking status in real time" },
              { icon: "✓", text: "Get digital meal passes on approval" },
              { icon: "✓", text: "5-digit attendance code at mess counter" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'rgba(131,166,206,0.2)', color: '#83A6CE' }}
                >{item.icon}</div>
                <span className="text-sm" style={{ color: '#E5C9D7' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)' }}
              >M</div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>MessBook</span>
            </Link>
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Already registered?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand-navy)' }}>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {generalError && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
              >
                {generalError}
              </div>
            )}
            <Input label="Full Name" name="name" type="text" placeholder="e.g. Aman Sharma" value={formData.name} onChange={handleChange} error={fieldErrors.name} required />
            <Input label="College Roll Number" name="rollNumber" type="text" placeholder="e.g. 21CS101" value={formData.rollNumber} onChange={handleChange} error={fieldErrors.rollNumber} required />
            <Input label="College Email" name="email" type="email" placeholder="student@college.edu" value={formData.email} onChange={handleChange} error={fieldErrors.email} required />
            <Input label="Password" name="password" type="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} error={fieldErrors.password} required />
            <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} error={fieldErrors.confirmPassword} required />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            By registering, you agree to pay meals at the mess office in cash. Digital coupons are issued after payment verification.
          </p>
        </div>
      </div>
    </div>
  );
}
