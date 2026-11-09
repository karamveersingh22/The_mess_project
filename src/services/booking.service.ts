import { dbConnect } from "@/lib/mongodb";
import {
  Booking,
  BookingItem,
  Week,
  WeeklyPrice,
  WeeklyMenu,
} from "@/models";
import { generateBookingCode } from "@/lib/utils";
import { DEFAULT_PRICES, MealType } from "@/types";
import mongoose from "mongoose";

export interface MealBookingSelection {
  date: string; // ISO string
  mealType: MealType;
  selectedOption?: string;
}

export interface CreateBookingResult {
  success: boolean;
  error?: string;
  data?: {
    bookingId: string;
    bookingCode: string;
    totalAmount: number;
    totalMeals: number;
    status: string;
  };
}

export async function submitStudentBooking(
  studentId: string,
  weekId: string,
  selections: MealBookingSelection[]
): Promise<CreateBookingResult> {
  await dbConnect();

  if (!selections || selections.length === 0) {
    return { success: false, error: "Please select at least one meal to book." };
  }

  // 1. Validate Week
  if (!mongoose.Types.ObjectId.isValid(weekId)) {
    return { success: false, error: "Invalid week specified." };
  }

  const week = await Week.findById(weekId);
  if (!week) {
    return { success: false, error: "Weekly cycle not found." };
  }

  const now = new Date();
  if (week.status !== "OPEN") {
    return {
      success: false,
      error: `Booking is currently ${week.status.toLowerCase()} for this week.`,
    };
  }

  if (now < week.bookingStart || now > week.bookingEnd) {
    return {
      success: false,
      error: "The booking window for this week is currently closed.",
    };
  }

  // 2. Prevent duplicate active booking for this student and week
  const existingActiveBooking = await Booking.findOne({
    studentId,
    weekId,
    status: { $in: ["PENDING", "APPROVED"] },
  });

  if (existingActiveBooking) {
    return {
      success: false,
      error: `You already have an active ${existingActiveBooking.status.toLowerCase()} booking for this week (${existingActiveBooking.bookingCode}).`,
    };
  }

  // 3. Fetch authoritative weekly prices
  const priceConfig = await WeeklyPrice.findOne({ weekId });
  const breakfastPrice = priceConfig?.breakfastPrice ?? DEFAULT_PRICES.breakfast;
  const lunchPrice = priceConfig?.lunchPrice ?? DEFAULT_PRICES.lunch;
  const dinnerPrice = priceConfig?.dinnerPrice ?? DEFAULT_PRICES.dinner;
  const minimumBookingAmount =
    priceConfig?.minimumBookingAmount ?? DEFAULT_PRICES.minimumBookingAmount;

  // 4. Fetch menu to validate and snapshot descriptions
  const menu = await WeeklyMenu.findOne({ weekId });

  // Map to check duplicate selection of the same meal in the request
  const uniqueKeySet = new Set<string>();
  let calculatedTotal = 0;

  interface PreparedItem {
    date: Date;
    mealType: MealType;
    selectedOption: string;
    mealDescriptionSnapshot: string;
    priceAtBooking: number;
  }

  const preparedItems: PreparedItem[] = [];

  for (const item of selections) {
    const itemDate = new Date(item.date);
    const dateStr = itemDate.toISOString().split("T")[0];
    const key = `${dateStr}_${item.mealType}`;

    if (uniqueKeySet.has(key)) {
      return {
        success: false,
        error: `Duplicate selection detected for ${item.mealType} on ${dateStr}.`,
      };
    }
    uniqueKeySet.add(key);

    let unitPrice = 0;
    if (item.mealType === "BREAKFAST") unitPrice = breakfastPrice;
    else if (item.mealType === "LUNCH") unitPrice = lunchPrice;
    else if (item.mealType === "DINNER") unitPrice = dinnerPrice;
    else {
      return { success: false, error: `Invalid meal type: ${item.mealType}` };
    }

    // Find snapshot description from menu if available
    let description = `${item.mealType} - Standard Mess Meal`;
    if (menu) {
      const dayMatch = menu.days.find(
        (d) => new Date(d.date).toISOString().split("T")[0] === dateStr
      );
      if (dayMatch) {
        const mealMatch = dayMatch.meals.find(
          (m) => m.mealType === item.mealType
        );
        if (mealMatch) {
          if (!mealMatch.isAvailable) {
            return {
              success: false,
              error: `${item.mealType} on ${dateStr} is marked unavailable.`,
            };
          }
          description = mealMatch.description;
        }
      }
    }

    calculatedTotal += unitPrice;

    preparedItems.push({
      date: itemDate,
      mealType: item.mealType,
      selectedOption: item.selectedOption || "",
      mealDescriptionSnapshot: description,
      priceAtBooking: unitPrice,
    });
  }

  // 5. Strictly enforce ₹300 minimum booking amount
  if (calculatedTotal < minimumBookingAmount) {
    return {
      success: false,
      error: `Your selected meals total ₹${calculatedTotal}. The minimum booking amount is ₹${minimumBookingAmount}. Please select more meals to continue.`,
    };
  }

  // 6. Create Booking and Items atomically
  const bookingCode = generateBookingCode();

  const newBooking = await Booking.create({
    bookingCode,
    studentId,
    weekId,
    totalAmount: calculatedTotal,
    totalMeals: preparedItems.length,
    status: "PENDING",
    paymentStatus: "UNVERIFIED",
    submittedAt: new Date(),
  });

  const itemsToInsert = preparedItems.map((item) => ({
    bookingId: newBooking._id,
    studentId,
    weekId,
    date: item.date,
    mealType: item.mealType,
    selectedOption: item.selectedOption,
    mealDescriptionSnapshot: item.mealDescriptionSnapshot,
    priceAtBooking: item.priceAtBooking,
  }));

  await BookingItem.insertMany(itemsToInsert);

  return {
    success: true,
    data: {
      bookingId: newBooking._id.toString(),
      bookingCode: newBooking.bookingCode,
      totalAmount: newBooking.totalAmount,
      totalMeals: newBooking.totalMeals,
      status: newBooking.status,
    },
  };
}

