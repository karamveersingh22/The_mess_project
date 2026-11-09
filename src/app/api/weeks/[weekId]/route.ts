import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Week, WeeklyPrice, WeeklyMenu } from "@/models";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const { weekId } = await params;

    if (!mongoose.Types.ObjectId.isValid(weekId)) {
      return NextResponse.json(
        { success: false, error: "Invalid week ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const week = await Week.findById(weekId).populate("createdBy", "name email");
    if (!week) {
      return NextResponse.json(
        { success: false, error: "Week not found" },
        { status: 404 }
      );
    }

    const price = await WeeklyPrice.findOne({ weekId: week._id });
    const hasMenu = Boolean(await WeeklyMenu.exists({ weekId: week._id }));

    return NextResponse.json({
      success: true,
      data: {
        week,
        price,
        hasMenu,
      },
    });
  } catch (error) {
    console.error("Error fetching week details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch week details" },
      { status: 500 }
    );
  }
}
