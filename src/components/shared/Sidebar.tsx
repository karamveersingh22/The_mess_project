"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  links: SidebarLink[];
  title: string;
}

export function Sidebar({ links, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-gray-200 md:bg-gray-50">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="px-4 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </h2>
        </div>
        <nav className="flex-1 space-y-1 px-3 pb-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/** Mobile navigation for student pages */
export function MobileNav({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <span className="mr-1">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

