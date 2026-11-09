import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string; }

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
    success: { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' },
    warning: { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' },
    danger: { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' },
    info: { background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid var(--info-border)' },
  };

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide", className)}
      style={styles[variant]}
    >
      {children}
    </span>
  );
}

export function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "APPROVED": case "VERIFIED": case "ACTIVE": return "success";
    case "PENDING": case "UNVERIFIED": case "UPCOMING": return "warning";
    case "REJECTED": case "CANCELLED": return "danger";
    case "OPEN": return "info";
    case "CLOSED": case "REDEEMED": return "default";
    default: return "default";
  }
}
