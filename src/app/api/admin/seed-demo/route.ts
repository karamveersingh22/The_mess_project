import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import {
  User,
  Week,
  WeeklyPrice,
  WeeklyMenu,
  Booking,
  BookingItem,
  Payment,
  Coupon,
} from "@/models";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_MESS_MENU } from "@/lib/constants/menu";
import { getWeekStart, getWeekEnd, generateBookingCode, generateCouponCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await dbConnect();

    // 1. Ensure Admin exists
    let admin = await User.findOne({ role: "ADMIN" });
    if (!admin) {
      const passwordHash = await hashPassword("AdminPassword@123");
      admin = await User.create({
        name: "Mess Administrator",
        rollNumber: "ADMIN001",
        email: "admin@mess.college",
        passwordHash,
        role: "ADMIN",
      });
    }

    // 2. Ensure Demo Student exists
    let demoStudent = await User.findOne({ email: "student@college.edu" });
    if (!demoStudent) {
      const studentHash = await hashPassword("Student@123");
      demoStudent = await User.create({
        name: "Aman Sharma",
        rollNumber: "21CS101",
        email: "student@college.edu",
        passwordHash: studentHash,
        role: "STUDENT",
      });
    }

    // Second demo student for pending booking
    let demoStudent2 = await User.findOne({ email: "priya@college.edu" });
    if (!demoStudent2) {
      const studentHash2 = await hashPassword("Student@123");
      demoStudent2 = await User.create({
        name: "Priya Patel",
        rollNumber: "21CS102",
        email: "priya@college.edu",
        passwordHash: studentHash2,
        role: "STUDENT",
      });
    }

    // 3. Create or get current active week (Monday to Sunday)
    const today = new Date();
    const monday = getWeekStart(today);
    const sunday = getWeekEnd(today);

    let activeWeek = await Week.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    if (!activeWeek) {
      // Create active week
      const bookingStart = new Date(monday);
      bookingStart.setDate(bookingStart.getDate() - 3); // Opened last Friday
      const bookingEnd = new Date(sunday);
      bookingEnd.setHours(23, 59, 59);

      activeWeek = await Week.create({
        startDate: monday,
        endDate: sunday,
        bookingStart,
        bookingEnd,
        status: "OPEN",
        createdBy: admin._id,
      });
    } else {
      activeWeek.status = "OPEN";
      await activeWeek.save();
    }

    // 4. Ensure Weekly Prices exist
    await WeeklyPrice.findOneAndUpdate(
      { weekId: activeWeek._id },
      {
        weekId: activeWeek._id,
        breakfastPrice: 25,
        lunchPrice: 45,
        dinnerPrice: 40,
        minimumBookingAmount: 300,
        updatedBy: admin._id,
      },
      { upsert: true }
    );

    // 5. Ensure Weekly Menu exists
    const weekDays = DEFAULT_MESS_MENU.map((d) => {
      const dayDate = new Date(activeWeek!.startDate);
      dayDate.setDate(dayDate.getDate() + d.dayOffset);
      return {
        date: dayDate,
        dayOfWeek: d.dayOfWeek,
        meals: d.meals,
      };
    });

    await WeeklyMenu.findOneAndUpdate(
      { weekId: activeWeek._id },
      { weekId: activeWeek._id, days: weekDays },
      { upsert: true }
    );

    // 6. Seed sample Pending Booking for student2 (Priya) if not exists
    let pendingBooking = await Booking.findOne({
      studentId: demoStudent2._id,
      weekId: activeWeek._id,
    });

    if (!pendingBooking) {
      const bCode = generateBookingCode();
      pendingBooking = await Booking.create({
        bookingCode: bCode,
        studentId: demoStudent2._id,
        weekId: activeWeek._id,
        totalAmount: 330, // > 300
        totalMeals: 9,
        status: "PENDING",
        paymentStatus: "UNVERIFIED",
        submittedAt: new Date(),
      });

      // Insert 9 items
      const sampleItems = [];
      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const itemDate = new Date(activeWeek.startDate);
        itemDate.setDate(itemDate.getDate() + dayOffset);

        sampleItems.push(
          {
            bookingId: pendingBooking._id,
            studentId: demoStudent2._id,
            weekId: activeWeek._id,
            date: itemDate,
            mealType: "BREAKFAST",
            selectedOption: "",
            mealDescriptionSnapshot: "Standard Breakfast",
            priceAtBooking: 25,
          },
          {
            bookingId: pendingBooking._id,
            studentId: demoStudent2._id,
            weekId: activeWeek._id,
            date: itemDate,
            mealType: "LUNCH",
            selectedOption: "",
            mealDescriptionSnapshot: "Standard Lunch",
            priceAtBooking: 45,
          },
          {
            bookingId: pendingBooking._id,
            studentId: demoStudent2._id,
            weekId: activeWeek._id,
            date: itemDate,
            mealType: "DINNER",
            selectedOption: "Matar Paneer",
            mealDescriptionSnapshot: "Standard Dinner with Special Option",
            priceAtBooking: 40,
          }
        );
      }
      await BookingItem.insertMany(sampleItems);
    }

    // 7. Seed sample Approved Booking for student1 (Aman) with Coupons if not exists
    let approvedBooking = await Booking.findOne({
      studentId: demoStudent._id,
      weekId: activeWeek._id,
    });

    if (!approvedBooking) {
      const bCode = generateBookingCode();
      approvedBooking = await Booking.create({
        bookingCode: bCode,
        studentId: demoStudent._id,
        weekId: activeWeek._id,
        totalAmount: 380,
        totalMeals: 10,
        status: "APPROVED",
        paymentStatus: "VERIFIED",
        submittedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: admin._id,
      });

      await Payment.create({
        bookingId: approvedBooking._id,
        studentId: demoStudent._id,
        amount: 380,
        method: "CASH",
        status: "VERIFIED",
        verifiedBy: admin._id,
        verifiedAt: new Date(),
        notes: "Demo cash payment verified",
      });

      // Insert items and coupons
      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const itemDate = new Date(activeWeek.startDate);
        itemDate.setDate(itemDate.getDate() + dayOffset);

        const item = await BookingItem.create({
          bookingId: approvedBooking._id,
          studentId: demoStudent._id,
          weekId: activeWeek._id,
          date: itemDate,
          mealType: "LUNCH",
          selectedOption: "",
          mealDescriptionSnapshot: "Feast Lunch",
          priceAtBooking: 45,
        });

        await Coupon.create({
          couponCode: generateCouponCode(),
          bookingId: approvedBooking._id,
          bookingItemId: item._id,
          studentId: demoStudent._id,
          weekId: activeWeek._id,
          date: itemDate,
          mealType: "LUNCH",
          mealDescriptionSnapshot: "Feast Lunch",
          status: "ACTIVE",
          generatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Complete demo environment initialized successfully!",
      data: {
        adminCredentials: {
          email: "admin@mess.college",
          password: "AdminPassword@123",
          role: "ADMIN",
        },
        studentCredentials: [
          {
            email: "student@college.edu",
            password: "Student@123",
            rollNumber: "21CS101",
            note: "Has an APPROVED booking with active coupons",
          },
          {
            email: "priya@college.edu",
            password: "Student@123",
            rollNumber: "21CS102",
            note: "Has a PENDING booking awaiting admin verification",
          },
        ],
        activeWeek: {
          id: activeWeek._id,
          startDate: activeWeek.startDate,
          endDate: activeWeek.endDate,
          status: activeWeek.status,
        },
      },
    });
  } catch (error) {
    console.error("Demo seeding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize demo data" },
      { status: 500 }
    );
  }
}

