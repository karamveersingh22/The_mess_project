import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking, Coupon, Week, WeeklyPrice } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_PRICES } from "@/types";

export const dynamic = "force-dynamic";

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

    // 1. Get current or open week
    const activeWeek = await Week.findOne({
      status: { $in: ["OPEN", "UPCOMING"] },
    }).sort({ startDate: -1 });

    // 2. Get active booking for this student in current cycle
    let activeBooking = null;
    if (activeWeek) {
      activeBooking = await Booking.findOne({
        studentId: user.id,
        weekId: activeWeek._id,
        status: { $in: ["PENDING", "APPROVED"] },
      });
    }

    // 3. Count total active coupons
    const couponCount = await Coupon.countDocuments({
      studentId: user.id,
      status: "ACTIVE",
    });

    // 4. Get active prices
    let prices = DEFAULT_PRICES;
    if (activeWeek) {
      const p = await WeeklyPrice.findOne({ weekId: activeWeek._id });
      if (p) {
        prices = {
          breakfast: p.breakfastPrice,
          lunch: p.lunchPrice,
          dinner: p.dinnerPrice,
          minimumBookingAmount: p.minimumBookingAmount,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        activeWeek: activeWeek
          ? {
              id: activeWeek._id,
              startDate: activeWeek.startDate,
              endDate: activeWeek.endDate,
              status: activeWeek.status,
            }
          : null,
        activeBooking: activeBooking
          ? {
              id: activeBooking._id,
              bookingCode: activeBooking.bookingCode,
              totalAmount: activeBooking.totalAmount,
              totalMeals: activeBooking.totalMeals,
              status: activeBooking.status,
              paymentStatus: activeBooking.paymentStatus,
            }
          : null,
        couponCount,
        prices,
      },
    });
  } catch (error) {
    console.error("Student metrics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load student metrics" },
      { status: 500 }
    );
  }
}

