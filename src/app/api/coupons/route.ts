import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Coupon } from "@/models";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const weekId = searchParams.get("weekId");

    await dbConnect();

    const query: Record<string, unknown> = { studentId: user.id };
    if (weekId) {
      query.weekId = weekId;
    }

    const coupons = await Coupon.find(query)
      .populate("weekId", "startDate endDate status")
      .populate("bookingId", "bookingCode")
      .sort({ date: 1, mealType: 1 });

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

