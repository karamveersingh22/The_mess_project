import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar, MobileNav } from "@/components/shared/Sidebar";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/counter", label: "Attendance Counter", icon: "⚡" },
  { href: "/admin/weeks", label: "Weekly Cycles", icon: "📅" },
  { href: "/admin/menu", label: "Menu Editor", icon: "🍽️" },
  { href: "/admin/prices", label: "Prices & Minimum", icon: "💰" },
  { href: "/admin/bookings", label: "Booking Requests", icon: "📋" },
  { href: "/admin/coupons", label: "Coupon Overview", icon: "🎫" },
  { href: "/admin/students", label: "Students", icon: "👥" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
      <Navbar user={{ name: `${user.name} (Admin)`, role: user.role }} />
      <MobileNav links={adminLinks} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={adminLinks} title="Mess Administration" />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}

