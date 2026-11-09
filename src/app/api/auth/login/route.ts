import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models";
import {
  comparePassword,
  signSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { validateLoginInput } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateLoginInput(body);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;

    await dbConnect();

    // Look up by email (lowercase) OR roll number (uppercase)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { rollNumber: identifier.toUpperCase() },
      ],
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email/roll number or password",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email/roll number or password",
        },
        { status: 401 }
      );
    }

    // Prepare session payload
    const sessionPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      role: user.role,
    };

    const token = await signSessionToken(sessionPayload);
    await setSessionCookie(token);

    const redirectUrl =
      user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: sessionPayload,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login. Please try again.",
      },
      { status: 500 }
    );
  }
}

