import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser, UserRole } from "@/types";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET || "default-mess-secret-change-in-production-2024";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "mess_session";
const TOKEN_EXPIRY = "7d"; // 7 days session

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Create a signed JWT token containing user session payload
 */
export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    rollNumber: user.rollNumber,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      rollNumber: payload.rollNumber as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Set session cookie in Route Handlers
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Delete session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Retrieve current session user from cookies in Server Components / Route Handlers
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Extract session user directly from NextRequest (useful in middleware or route handlers)
 */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };

