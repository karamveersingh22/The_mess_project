import { dbConnect } from "@/lib/mongodb";
import { BookingItem, Coupon, IBooking } from "@/models";
import { generateCouponCode, generateVerificationCode } from "@/lib/utils";

export async function generateCouponsForBooking(
  booking: IBooking
): Promise<{ success: boolean; createdCount: number; error?: string }> {
  await dbConnect();

  try {
    const bookingItems = await BookingItem.find({ bookingId: booking._id });

    if (!bookingItems || bookingItems.length === 0) {
      return { success: false, createdCount: 0, error: "No meal items found for booking" };
    }

    let createdCount = 0;

    for (const item of bookingItems) {
      // Idempotency check: see if a coupon already exists for this item
      const existing = await Coupon.findOne({ bookingItemId: item._id });
      if (existing) {
        continue;
      }

      const couponCode = generateCouponCode();
      const verificationCode = generateVerificationCode();

      await Coupon.create({
        couponCode,
        verificationCode,
        bookingId: booking._id,
        bookingItemId: item._id,
        studentId: booking.studentId,
        weekId: booking.weekId,
        date: item.date,
        mealType: item.mealType,
        mealDescriptionSnapshot: item.mealDescriptionSnapshot,
        status: "ACTIVE",
        generatedAt: new Date(),
      });

      createdCount++;
    }

    return { success: true, createdCount };
  } catch (error) {
    console.error("Error generating coupons:", error);
    return {
      success: false,
      createdCount: 0,
      error: error instanceof Error ? error.message : "Failed to generate coupons",
    };
  }
}

