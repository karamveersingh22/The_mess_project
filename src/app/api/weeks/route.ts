import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Week } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const weeks = await Week.find({})
      .sort({ startDate: -1 })
      .populate("createdBy", "name email");

    return NextResponse.json({
      success: true,
      data: weeks,
    });
  } catch (error) {
    console.error("Error fetching weeks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch weeks" },
      { status: 500 }
    );
  }
}
