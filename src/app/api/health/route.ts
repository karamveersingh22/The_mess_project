import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongoose = await dbConnect();
    const dbState = mongoose.connection.readyState;

    const stateLabels: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return NextResponse.json({
      success: true,
      data: {
        status: "ok",
        database: stateLabels[dbState] || "unknown",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
