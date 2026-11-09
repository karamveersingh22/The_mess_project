import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { User, Booking } from "@/models";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    await dbConnect();

    const students = await User.find({ role: "STUDENT" })
      .select("name rollNumber email createdAt")
      .sort({ createdAt: -1 });

    // Aggregate booking counts per student
    const bookingCounts = await Booking.aggregate([
      { $group: { _id: "$studentId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      bookingCounts.map((b) => [b._id.toString(), b.count])
    );

    const data = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      email: s.email,
      createdAt: s.createdAt,
      totalBookings: countMap.get(s._id.toString()) || 0,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

