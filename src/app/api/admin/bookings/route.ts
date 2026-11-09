import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Booking, User } from "@/models";
import { getSessionUser } from "@/lib/auth";

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
    const status = searchParams.get("status");
    const weekId = searchParams.get("weekId");
    const search = searchParams.get("search");

    await dbConnect();

    const query: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (weekId && weekId !== "ALL") {
      query.weekId = weekId;
    }

    // If searching by roll number or name
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), "i");
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { rollNumber: searchRegex }],
      }).select("_id");
      const userIds = matchedUsers.map((u) => u._id);
      query.studentId = { $in: userIds };
    }

    const bookings = await Booking.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("weekId", "startDate endDate status")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

