import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models";
import {
  hashPassword,
  signSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { validateRegisterInput } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRegisterInput(body);

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

    const { name, rollNumber, email, password } = validation.data;

    await dbConnect();

    // Check if user with same roll number exists
    const existingRoll = await User.findOne({ rollNumber });
    if (existingRoll) {
      return NextResponse.json(
        {
          success: false,
          error: "A student with this roll number is already registered",
          errors: { rollNumber: "Roll number is already registered" },
        },
        { status: 409 }
      );
    }

    // Check if user with same email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists",
          errors: { email: "Email is already registered" },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user strictly with STUDENT role
    const newUser = await User.create({
      name,
      rollNumber,
      email,
      passwordHash,
      role: "STUDENT",
    });

    // Generate JWT and set session cookie
    const sessionPayload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      rollNumber: newUser.rollNumber,
      role: newUser.role,
    };

    const token = await signSessionToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: sessionPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}

