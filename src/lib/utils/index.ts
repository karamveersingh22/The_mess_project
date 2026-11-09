import { type ClassValue, clsx } from "clsx";

/**
 * Utility to merge class names. Simple implementation without tailwind-merge
 * since we control our own class usage.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export const APP_TIMEZONE = "Asia/Kolkata";

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Format a date to a readable string in Indian Standard Time (IST)
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to show day and date only in Indian Standard Time (IST)
 */
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns YYYY-MM-DD string in the application timezone (Asia/Kolkata)
 */
export function getDateStringInAppTZ(date: Date | string = new Date()): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

/**
 * Checks if two dates represent the exact same calendar day in Indian Standard Time
 */
export function isSameDayInAppTZ(
  date1: Date | string,
  date2: Date | string = new Date()
): boolean {
  return getDateStringInAppTZ(date1) === getDateStringInAppTZ(date2);
}

/**
 * Get the UTC Date bounds (start and end) for a given calendar day in Indian Standard Time
 */
export function getDayBoundsInAppTZ(date: Date | string = new Date()): {
  start: Date;
  end: Date;
} {
  const dateStr = getDateStringInAppTZ(date); // e.g. "2026-11-09"
  const start = new Date(`${dateStr}T00:00:00.000+05:30`);
  const end = new Date(`${dateStr}T23:59:59.999+05:30`);
  return { start, end };
}

/**
 * Generate a unique booking code
 */
export function generateBookingCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

/**
 * Generate a unique coupon code
 */
export function generateCouponCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CP-${timestamp}-${random}`;
}

/**
 * Generate a 5-digit numeric verification code for quick counter attendance
 */
export function generateVerificationCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Sunday of the week for a given date
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

