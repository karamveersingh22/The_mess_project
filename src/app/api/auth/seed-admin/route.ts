import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await dbConnect();

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin account already exists",
        data: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          rollNumber: existingAdmin.rollNumber,
          role: existingAdmin.role,
        },
      });
    }

    // Default admin credentials
    const defaultEmail = "admin@mess.college";
    const defaultPassword = "AdminPassword@123";
    const passwordHash = await hashPassword(defaultPassword);

    const admin = await User.create({
      name: "Mess Administrator",
      rollNumber: "ADMIN001",
      email: defaultEmail,
      passwordHash,
      role: "ADMIN",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account initialized successfully",
        data: {
          email: admin.email,
          name: admin.name,
          rollNumber: admin.rollNumber,
          role: admin.role,
          credentialsHint: `Email: ${defaultEmail} | Password: ${defaultPassword}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize admin account",
      },
      { status: 500 }
    );
  }
}

