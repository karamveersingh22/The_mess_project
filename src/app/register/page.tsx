"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side confirmation check
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
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setGeneralError(data.error || "Registration failed");
        }
        setLoading(false);
        return;
      }

      // Automatically logged in via cookie, redirect to student dashboard
      router.push("/student/dashboard");
      router.refresh();
    } catch {
      setGeneralError("A network error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-3xl font-extrabold text-blue-900">
          🍽️ MessBook
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          Create a Student Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-900 hover:text-blue-800 underline underline-offset-4"
          >
            Sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {generalError}
                </div>
              )}

              <Input
                label="Full Name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                error={fieldErrors.name}
                required
              />

              <Input
                label="College Roll Number"
                name="rollNumber"
                type="text"
                placeholder="e.g. 21CS101"
                value={formData.rollNumber}
                onChange={handleChange}
                error={fieldErrors.rollNumber}
                required
              />

              <Input
                label="College Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@college.edu"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
              >
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 w-full">
              By registering, you can book meals online and receive digital coupons once verified by mess admin.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

