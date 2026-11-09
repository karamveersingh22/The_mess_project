import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { WeeklyMenu, Week } from "@/models";
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

    const menu = await WeeklyMenu.findOne({ weekId });

    if (!menu) {
      const week = await Week.findById(weekId);
      if (!week) {
        return NextResponse.json(
          { success: false, error: "Week not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Menu not found for this week" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

