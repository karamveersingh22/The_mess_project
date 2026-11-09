import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar, MobileNav } from "@/components/shared/Sidebar";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/student/menu", label: "Weekly Menu", icon: "📋" },
  { href: "/student/booking", label: "Book Meals", icon: "🍽️" },
  { href: "/student/history", label: "Booking History", icon: "📜" },
  { href: "/student/coupons", label: "My Coupons", icon: "🎫" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
      <Navbar user={{ name: user.name, role: user.role }} />
      <MobileNav links={studentLinks} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={studentLinks} title="Student Portal" />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}

