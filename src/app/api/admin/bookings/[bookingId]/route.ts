import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking, BookingItem, Payment } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { generateCouponsForBooking } from "@/services/coupon.service";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/admin/bookings/[bookingId]
// Returns booking details along with all its itemized meal selections
export async function GET(
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

    const booking = await Booking.findById(bookingId)
      .populate("studentId", "name rollNumber email")
      .populate("weekId", "startDate endDate status");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking request not found" },
        { status: 404 }
      );
    }

    const items = await BookingItem.find({ bookingId }).sort({
      date: 1,
      mealType: 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        booking,
        items,
      },
    });
  } catch (error) {
    console.error("Error fetching admin booking details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load booking details" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/bookings/[bookingId]
// Handles cash verification approval (action: 'APPROVE') or rejection (action: 'REJECT')
export async function PATCH(
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

    const body = await req.json();
    const { action, rejectionReason } = body;

    await dbConnect();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking request not found" },
        { status: 404 }
      );
    }

    if (action === "APPROVE") {
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot approve booking with status '${booking.status}'. Only PENDING bookings can be approved.`,
          },
          { status: 400 }
        );
      }

      // 1. Record verified cash payment
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

      // 2. Mark booking approved
      booking.status = "APPROVED";
      booking.paymentStatus = "VERIFIED";
      booking.approvedAt = new Date();
      booking.approvedBy = new mongoose.Types.ObjectId(user.id);
      await booking.save();

      // 3. Atomically issue digital coupons
      const couponResult = await generateCouponsForBooking(booking);

      return NextResponse.json({
        success: true,
        message: `Booking ${booking.bookingCode} approved successfully. ${couponResult.createdCount} coupons issued.`,
        data: {
          booking,
          couponsCreated: couponResult.createdCount,
        },
      });
    } else if (action === "REJECT") {
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reject booking with status '${booking.status}'.`,
          },
          { status: 400 }
        );
      }

      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json(
          { success: false, error: "A rejection reason is required." },
          { status: 400 }
        );
      }

      booking.status = "REJECTED";
      booking.paymentStatus = "REJECTED";
      booking.rejectedAt = new Date();
      booking.rejectedBy = new mongoose.Types.ObjectId(user.id);
      booking.rejectionReason = rejectionReason.trim();
      await booking.save();

      return NextResponse.json({
        success: true,
        message: `Booking ${booking.bookingCode} has been rejected.`,
        data: {
          booking,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'APPROVE' or 'REJECT'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}

