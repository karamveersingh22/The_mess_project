import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Week, WeeklyPrice, WeeklyMenu } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_MESS_MENU } from "@/lib/constants/menu";
import { DEFAULT_PRICES } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { startDate, endDate, bookingStart, bookingEnd, status } = body;

    if (!startDate || !endDate || !bookingStart || !bookingEnd) {
      return NextResponse.json(
        {
          success: false,
          error: "Start date, end date, booking start, and booking end are all required",
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const bStart = new Date(bookingStart);
    const bEnd = new Date(bookingEnd);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    if (bStart >= bEnd) {
      return NextResponse.json(
        { success: false, error: "Booking start time must be before booking end time" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for overlapping weeks
    const overlapping = await Week.findOne({
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: "A weekly cycle overlapping these dates already exists",
        },
        { status: 409 }
      );
    }

    // Create the Week
    const week = await Week.create({
      startDate: start,
      endDate: end,
      bookingStart: bStart,
      bookingEnd: bEnd,
      status: status || "UPCOMING",
      createdBy: user.id,
    });

    // Initialize Default Pricing for this week
    await WeeklyPrice.create({
      weekId: week._id,
      breakfastPrice: DEFAULT_PRICES.breakfast,
      lunchPrice: DEFAULT_PRICES.lunch,
      dinnerPrice: DEFAULT_PRICES.dinner,
      minimumBookingAmount: DEFAULT_PRICES.minimumBookingAmount,
      updatedBy: user.id,
    });

    // Initialize Default Seed Menu for this week
    const weekDays = DEFAULT_MESS_MENU.map((d) => {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + d.dayOffset);
      return {
        date: dayDate,
        dayOfWeek: d.dayOfWeek,
        meals: d.meals,
      };
    });

    await WeeklyMenu.create({
      weekId: week._id,
      days: weekDays,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Weekly cycle, default pricing, and menu created successfully",
        data: week,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating week:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create weekly cycle" },
      { status: 500 }
    );
  }
}
