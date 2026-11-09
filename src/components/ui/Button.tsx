import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children, className, variant = "primary", size = "md",
  isLoading = false, disabled, style, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants: Record<string, string> = {
    primary: "text-white focus:ring-blue-500",
    secondary: "focus:ring-gray-400",
    danger: "text-white focus:ring-red-500",
    success: "text-white focus:ring-green-500",
    ghost: "focus:ring-gray-400",
    outline: "focus:ring-blue-500",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  const inlineStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, var(--brand-navy), var(--brand-slate))', color: '#ffffff' },
    secondary: { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' },
    danger: { background: '#DC2626', color: '#ffffff' },
    success: { background: '#059669', color: '#ffffff' },
    ghost: { background: 'transparent', color: 'inherit' },
    outline: { background: 'transparent', border: '1.5px solid var(--border-brand)', color: 'inherit' },
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={{ ...inlineStyles[variant], ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
