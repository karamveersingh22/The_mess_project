"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: {
    name: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-900">🍽️ MessBook</span>
        </Link>

        <nav className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-900",
                  pathname === "/login" ? "text-blue-900" : "text-gray-600"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

