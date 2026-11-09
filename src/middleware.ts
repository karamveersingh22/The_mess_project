import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET || "default-mess-secret-change-in-production-2024";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "mess_session";

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  role: "STUDENT" | "ADMIN";
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  const isStudentRoute = pathname.startsWith("/student");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // 1. If trying to access protected routes without a valid session
  if ((isStudentRoute || isAdminRoute) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If student tries to access admin routes
  if (isAdminRoute && user && user.role !== "ADMIN") {
    // Forbidden: redirect to student dashboard
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // 3. If already logged in and visits login or register
  if (isAuthRoute && user) {
    const destination =
      user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

