import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MessBook — Smart Mess Meal Booking",
  description: "Smart Mess Meal Booking and Coupon Management System for college students",
};

// Inline script to prevent flash of unstyled theme
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('messbook-theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
