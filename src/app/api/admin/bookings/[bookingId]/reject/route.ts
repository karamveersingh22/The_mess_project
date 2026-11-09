import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking } from "@/models";
import { getSessionUser } from "@/lib/auth";
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

    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A reason is required to reject a booking.",
        },
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

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot reject booking with status '${booking.status}'.`,
        },
        { status: 400 }
      );
    }

    booking.status = "REJECTED";
    booking.paymentStatus = "REJECTED";
    booking.rejectedAt = new Date();
    booking.rejectedBy = new mongoose.Types.ObjectId(user.id);
    booking.rejectionReason = reason.trim();
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Booking rejected successfully",
      data: {
        bookingId: booking._id,
        status: booking.status,
        rejectionReason: booking.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Booking rejection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject booking" },
      { status: 500 }
    );
  }
}

