import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Helper to get badge variant based on booking/payment status
 */
export function getStatusVariant(
  status: string
): BadgeVariant {
  switch (status) {
    case "APPROVED":
    case "VERIFIED":
    case "ACTIVE":
      return "success";
    case "PENDING":
    case "UNVERIFIED":
    case "UPCOMING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "OPEN":
      return "info";
    case "CLOSED":
    case "REDEEMED":
      return "default";
    default:
      return "default";
  }
}

