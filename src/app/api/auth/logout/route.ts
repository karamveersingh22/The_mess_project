import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await clearSessionCookie();

  // If request came from a form submit, redirect to login page
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}

