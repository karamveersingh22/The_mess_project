import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MessBook - Smart Mess Meal Booking",
  description:
    "Smart Mess Meal Booking and Coupon Management System for college students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
