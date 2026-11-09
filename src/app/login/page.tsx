"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

      // Check for callback URL in query params
      const searchParams = new URLSearchParams(window.location.search);
      const callback = searchParams.get("callbackUrl");
      const targetUrl = callback || data.data.redirectUrl || "/student/dashboard";

      router.push(targetUrl);
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-blue-900 hover:text-blue-800 underline underline-offset-4"
          >
            register as a new student
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <Input
                label="Email or Roll Number"
                type="text"
                placeholder="e.g. 21CS001 or student@college.edu"
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 w-full">
              Mess Admins can also sign in with their admin email credentials.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

