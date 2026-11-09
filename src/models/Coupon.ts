import mongoose, { Schema, Document, Model } from "mongoose";

export type CouponStatus = "ACTIVE" | "REDEEMED" | "CANCELLED";

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  couponCode: string;
  verificationCode: string; // 5-digit code for quick physical counter attendance
  bookingId: mongoose.Types.ObjectId;
  bookingItemId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  weekId: mongoose.Types.ObjectId;
  date: Date;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mealDescriptionSnapshot: string;
  status: CouponStatus;
  generatedAt: Date;
  redeemedAt?: Date;
  redeemedBy?: mongoose.Types.ObjectId;
}

const CouponSchema = new Schema<ICoupon>(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    verificationCode: {
      type: String,
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    bookingItemId: {
      type: Schema.Types.ObjectId,
      ref: "BookingItem",
      required: true,
      unique: true, // One coupon per booking item
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekId: {
      type: Schema.Types.ObjectId,
      ref: "Week",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "DINNER"],
      required: true,
    },
    mealDescriptionSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "REDEEMED", "CANCELLED"],
      default: "ACTIVE",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    redeemedAt: {
      type: Date,
    },
    redeemedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
CouponSchema.index({ studentId: 1, date: 1 });
CouponSchema.index({ weekId: 1, mealType: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;

