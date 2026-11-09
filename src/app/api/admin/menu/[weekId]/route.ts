import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { WeeklyMenu, Week } from "@/models";
import { getSessionUser } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { weekId } = await params;
    if (!mongoose.Types.ObjectId.isValid(weekId)) {
      return NextResponse.json(
        { success: false, error: "Invalid week ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { days } = body;

    if (!Array.isArray(days) || days.length !== 7) {
      return NextResponse.json(
        {
          success: false,
          error: "A complete weekly menu must contain exactly 7 days (Monday through Sunday)",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const week = await Week.findById(weekId);
    if (!week) {
      return NextResponse.json(
        { success: false, error: "Week not found" },
        { status: 404 }
      );
    }

    const updatedMenu = await WeeklyMenu.findOneAndUpdate(
      { weekId },
      { weekId, days },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Weekly menu saved successfully",
      data: updatedMenu,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

