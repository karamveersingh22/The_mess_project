import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { WeeklyMenu, Week } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_MESS_MENU } from "@/lib/constants/menu";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
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

    await dbConnect();

    const week = await Week.findById(weekId);
    if (!week) {
      return NextResponse.json(
        { success: false, error: "Week not found" },
        { status: 404 }
      );
    }

    const weekDays = DEFAULT_MESS_MENU.map((d) => {
      const dayDate = new Date(week.startDate);
      dayDate.setDate(dayDate.getDate() + d.dayOffset);
      return {
        date: dayDate,
        dayOfWeek: d.dayOfWeek,
        meals: d.meals,
      };
    });

    const menu = await WeeklyMenu.findOneAndUpdate(
      { weekId },
      { weekId, days: weekDays },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Default menu loaded successfully",
      data: menu,
    });
  } catch (error) {
    console.error("Error seeding menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed menu" },
      { status: 500 }
    );
  }
}

