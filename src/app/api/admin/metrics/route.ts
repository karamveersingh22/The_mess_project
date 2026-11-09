import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking, Payment, Coupon, User, Week } from "@/models";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      verifiedPayments,
      couponCount,
      studentCount,
      activeWeek,
    ] = await Promise.all([
      Booking.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({ status: "APPROVED" }),
      Booking.countDocuments({ status: "REJECTED" }),
      Payment.aggregate([
        { $match: { status: "VERIFIED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Coupon.countDocuments({}),
      User.countDocuments({ role: "STUDENT" }),
      Week.findOne({ status: "OPEN" }),
    ]);

    const totalVerifiedAmount =
      verifiedPayments.length > 0 ? verifiedPayments[0].total : 0;

    return NextResponse.json({
      success: true,
      data: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalVerifiedAmount,
        couponCount,
        studentCount,
        activeWeek: activeWeek
          ? {
              id: activeWeek._id,
              startDate: activeWeek.startDate,
              endDate: activeWeek.endDate,
              status: activeWeek.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}

