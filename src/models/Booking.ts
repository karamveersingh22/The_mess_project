import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type PaymentStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingCode: string;
  studentId: mongoose.Types.ObjectId;
  weekId: mongoose.Types.ObjectId;
  totalAmount: number;
  totalMeals: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
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
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    totalMeals: {
      type: Number,
      required: true,
      min: [1, "At least one meal must be selected"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Compound index: only one active booking per student per week
// Allow resubmission if previous booking was REJECTED or CANCELLED
BookingSchema.index(
  { studentId: 1, weekId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["PENDING", "APPROVED"] },
    },
  }
);
BookingSchema.index({ status: 1 });
BookingSchema.index({ weekId: 1 });
BookingSchema.index({ bookingCode: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;

