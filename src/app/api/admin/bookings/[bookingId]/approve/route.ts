import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking, Payment } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { generateCouponsForBooking } from "@/services/coupon.service";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking request not found" },
        { status: 404 }
      );
    }

    // Must be PENDING
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve booking with status '${booking.status}'. Only PENDING bookings can be approved.`,
        },
        { status: 400 }
      );
    }

    // 1. Record physical payment verification
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      {
        bookingId: booking._id,
        studentId: booking.studentId,
        amount: booking.totalAmount,
        method: "CASH",
        status: "VERIFIED",
        verifiedBy: user.id,
        verifiedAt: new Date(),
        notes: "Physical cash payment verified in mess office",
      },
      { upsert: true, new: true }
    );

    // 2. Update booking status
    booking.status = "APPROVED";
    booking.paymentStatus = "VERIFIED";
    booking.approvedAt = new Date();
    booking.approvedBy = new mongoose.Types.ObjectId(user.id);
    await booking.save();

    // 3. Atomically generate digital coupons
    const couponResult = await generateCouponsForBooking(booking);

    return NextResponse.json({
      success: true,
      message: `Payment verified and booking approved. ${couponResult.createdCount} digital coupons generated.`,
      data: {
        bookingId: booking._id,
        status: booking.status,
        couponsGenerated: couponResult.createdCount,
      },
    });
  } catch (error) {
    console.error("Booking approval error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve booking" },
      { status: 500 }
    );
  }
}

