// Shared types used across the application

export type UserRole = "STUDENT" | "ADMIN";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type PaymentStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export type CouponStatus = "ACTIVE" | "REDEEMED" | "CANCELLED";

export type WeekStatus = "UPCOMING" | "OPEN" | "CLOSED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MealOption {
  label: string;
  description: string;
}

export interface MealSelection {
  date: string; // ISO date string
  mealType: MealType;
  selectedOption?: string;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNVERIFIED: "Unverified",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const DEFAULT_PRICES = {
  breakfast: 25,
  lunch: 45,
  dinner: 40,
  minimumBookingAmount: 300,
};

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

