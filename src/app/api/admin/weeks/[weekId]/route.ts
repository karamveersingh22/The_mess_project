import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Week } from "@/models";
import { getSessionUser } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
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
    const { status, bookingStart, bookingEnd } = body;

    await dbConnect();

    const week = await Week.findById(weekId);
    if (!week) {
      return NextResponse.json(
        { success: false, error: "Week not found" },
        { status: 404 }
      );
    }

    if (status) {
      if (!["UPCOMING", "OPEN", "CLOSED"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      week.status = status;
    }

    if (bookingStart) {
      week.bookingStart = new Date(bookingStart);
    }

    if (bookingEnd) {
      week.bookingEnd = new Date(bookingEnd);
    }

    if (week.bookingStart >= week.bookingEnd) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking start time must be before booking end time",
        },
        { status: 400 }
      );
    }

    await week.save();

    return NextResponse.json({
      success: true,
      message: "Weekly cycle updated successfully",
      data: week,
    });
  } catch (error) {
    console.error("Error updating week:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update week" },
      { status: 500 }
    );
  }
}
