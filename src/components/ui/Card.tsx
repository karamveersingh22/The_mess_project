import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl shadow-sm transition-shadow", className)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, style }: CardProps) {
  return (
    <div
      className={cn("px-5 py-4", className)}
      style={{ borderBottom: '1px solid var(--border-muted)', ...style }}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h3
      className={cn("text-base font-bold", className)}
      style={{ color: 'var(--text-primary)', ...style }}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, style }: CardProps) {
  return (
    <div className={cn("px-5 py-4", className)} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, style }: CardProps) {
  return (
    <div
      className={cn("px-5 py-3 rounded-b-2xl", className)}
      style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-muted)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
