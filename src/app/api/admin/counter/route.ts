import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Coupon } from "@/models";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch today's counter attendance summary and recent redemptions
 */
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
    const mealFilter = searchParams.get("mealType") || "ALL";

    await dbConnect();

    // Today's date range (midnight to 23:59:59)
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const baseQuery: Record<string, unknown> = {
      date: { $gte: startOfToday, $lte: endOfToday },
    };

    if (mealFilter !== "ALL") {
      baseQuery.mealType = mealFilter;
    }

    const [totalExpected, totalRedeemed, recentRedemptions] = await Promise.all([
      Coupon.countDocuments(baseQuery),
      Coupon.countDocuments({ ...baseQuery, status: "REDEEMED" }),
      Coupon.find({ ...baseQuery, status: "REDEEMED" })
        .populate("studentId", "name rollNumber")
        .sort({ redeemedAt: -1 })
        .limit(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        mealFilter,
        stats: {
          expected: totalExpected,
          served: totalRedeemed,
          remaining: Math.max(0, totalExpected - totalRedeemed),
        },
        recentRedemptions,
      },
    });
  } catch (error) {
    console.error("Counter summary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch counter data" },
      { status: 500 }
    );
  }
}

/**
 * POST: Verify 5-digit coupon code and mark attendance
 */
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
    const rawCode = body.verificationCode?.toString().trim();

    if (!rawCode || rawCode.length !== 5 || !/^\d{5}$/.test(rawCode)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 5-digit numeric coupon code." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find coupon with populated student
    const coupon = await Coupon.findOne({ verificationCode: rawCode })
      .populate("studentId", "name rollNumber email")
      .populate("bookingId", "bookingCode");

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          error: `No meal coupon matches code "${rawCode}". Please re-check the 5 digits with the student.`,
        },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = coupon.studentId as any;
    const studentName = student?.name || "Unknown Student";
    const rollNumber = student?.rollNumber || "N/A";

    // 1. Check if already REDEEMED
    if (coupon.status === "REDEEMED") {
      const redeemedTime = coupon.redeemedAt
        ? new Date(coupon.redeemedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "earlier today";

      return NextResponse.json(
        {
          success: false,
          error: `ALREADY REDEEMED at ${redeemedTime} by ${studentName} (${rollNumber}) for ${coupon.mealType}. Second meal collection is strictly prohibited.`,
          data: {
            coupon,
            alreadyRedeemed: true,
          },
        },
        { status: 400 }
      );
    }

    // 2. Check if CANCELLED
    if (coupon.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: `This coupon was CANCELLED and cannot be used for meals.`,
        },
        { status: 400 }
      );
    }

    // 3. Date check: Ensure coupon matches today's date
    const today = new Date();
    const couponDate = new Date(coupon.date);

    const isSameDate =
      today.getFullYear() === couponDate.getFullYear() &&
      today.getMonth() === couponDate.getMonth() &&
      today.getDate() === couponDate.getDate();

    if (!isSameDate) {
      const dateFormatted = couponDate.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return NextResponse.json(
        {
          success: false,
          error: `Date Mismatch! This ${coupon.mealType} coupon is scheduled for ${dateFormatted}, not today.`,
        },
        { status: 400 }
      );
    }

    // 4. Mark coupon as REDEEMED atomically
    coupon.status = "REDEEMED";
    coupon.redeemedAt = new Date();
    coupon.redeemedBy = new mongoose.Types.ObjectId(user.id);
    await coupon.save();

    return NextResponse.json({
      success: true,
      message: `Verified! ${coupon.mealType} meal marked for ${studentName} (${rollNumber}).`,
      data: {
        couponId: coupon._id,
        verificationCode: coupon.verificationCode,
        mealType: coupon.mealType,
        mealDescription: coupon.mealDescriptionSnapshot,
        studentName,
        rollNumber,
        redeemedAt: coupon.redeemedAt,
      },
    });
  } catch (error) {
    console.error("Coupon verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify coupon code" },
      { status: 500 }
    );
  }
}

