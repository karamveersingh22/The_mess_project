"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user?: { name: string; role: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))', color: '#fff' }}
          >
            M
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            MessBook
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors"
                style={{ background: 'var(--brand-navy)', color: '#fff' }}
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {user.role}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, var(--brand-rose), var(--brand-blue))', color: '#fff' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:block px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
