import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { WeeklyPrice, Week } from "@/models";
import { DEFAULT_PRICES } from "@/types";
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

    let price = await WeeklyPrice.findOne({ weekId });

    if (!price) {
      // Check if week exists
      const week = await Week.findById(weekId);
      if (!week) {
        return NextResponse.json(
          { success: false, error: "Week not found" },
          { status: 404 }
        );
      }

      // Return default prices if not yet explicitly saved
      return NextResponse.json({
        success: true,
        data: {
          weekId,
          breakfastPrice: DEFAULT_PRICES.breakfast,
          lunchPrice: DEFAULT_PRICES.lunch,
          dinnerPrice: DEFAULT_PRICES.dinner,
          minimumBookingAmount: DEFAULT_PRICES.minimumBookingAmount,
          isDefault: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error) {
    console.error("Error fetching weekly prices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
