import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Booking, BookingItem } from "@/models";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { bookingId } = await params;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId)
      .populate("weekId", "startDate endDate status")
      .populate("studentId", "name rollNumber email");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Ownership check: If student, verify it belongs to them
    if (
      user.role === "STUDENT" &&
      booking.studentId._id.toString() !== user.id
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this booking" },
        { status: 403 }
      );
    }

    const items = await BookingItem.find({ bookingId }).sort({
      date: 1,
      mealType: 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        booking,
        items,
      },
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}

