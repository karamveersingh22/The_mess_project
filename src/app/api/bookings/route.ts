import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { submitStudentBooking } from "@/services/booking.service";
import { Booking } from "@/models";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Submit a new booking
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to submit a booking." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { weekId, selections } = body;

    if (!weekId || !selections || !Array.isArray(selections)) {
      return NextResponse.json(
        {
          success: false,
          error: "Week ID and meal selections array are required.",
        },
        { status: 400 }
      );
    }

    const result = await submitStudentBooking(user.id, weekId, selections);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking submitted successfully. Please complete physical payment at the mess office.",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit booking. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Get authenticated student's bookings
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const bookings = await Booking.find({ studentId: user.id })
      .populate("weekId", "startDate endDate status")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

