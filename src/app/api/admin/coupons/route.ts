import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Coupon } from "@/models";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const weekId = searchParams.get("weekId");
    const mealType = searchParams.get("mealType");

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (weekId && weekId !== "ALL") query.weekId = weekId;
    if (mealType && mealType !== "ALL") query.mealType = mealType;

    const coupons = await Coupon.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("weekId", "startDate endDate")
      .populate("bookingId", "bookingCode")
      .sort({ date: 1, mealType: 1 });

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

