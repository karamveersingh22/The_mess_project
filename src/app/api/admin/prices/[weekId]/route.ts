import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { WeeklyPrice, Week } from "@/models";
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
    const {
      breakfastPrice,
      lunchPrice,
      dinnerPrice,
      minimumBookingAmount,
    } = body;

    // Validate numbers
    if (
      typeof breakfastPrice !== "number" ||
      typeof lunchPrice !== "number" ||
      typeof dinnerPrice !== "number" ||
      typeof minimumBookingAmount !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All prices and minimum booking amount must be valid numbers",
        },
        { status: 400 }
      );
    }

    if (
      breakfastPrice < 0 ||
      lunchPrice < 0 ||
      dinnerPrice < 0 ||
      minimumBookingAmount < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Prices and minimum amount cannot be negative" },
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

    const updatedPrice = await WeeklyPrice.findOneAndUpdate(
      { weekId },
      {
        weekId,
        breakfastPrice,
        lunchPrice,
        dinnerPrice,
        minimumBookingAmount,
        updatedBy: user.id,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Prices updated successfully",
      data: updatedPrice,
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
