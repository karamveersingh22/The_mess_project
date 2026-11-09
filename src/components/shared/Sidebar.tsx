"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink { href: string; label: string; icon: string; }
interface SidebarProps { links: SidebarLink[]; title: string; }

export function Sidebar({ links, title }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex md:w-56 md:flex-col flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)' }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {title}
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 pb-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))',
                  color: '#FFFFFF',
                } : {
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{link.icon}</span>
                <span className="truncate">{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function MobileNav({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden flex overflow-x-auto px-3 py-2 gap-1.5 no-scrollbar"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
    >
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
            style={isActive ? {
              background: 'var(--brand-navy)',
              color: '#FFFFFF',
            } : {
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-muted)',
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
