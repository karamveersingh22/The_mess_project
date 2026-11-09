import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify session",
      },
      { status: 500 }
    );
  }
}

