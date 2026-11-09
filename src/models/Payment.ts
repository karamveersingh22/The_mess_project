import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentMethod = "PHYSICAL" | "CASH";
export type PaymentRecordStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    method: {
      type: String,
      enum: ["PHYSICAL", "CASH"],
      default: "CASH",
    },
    status: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ status: 1 });
// Prevent multiple verified payments for the same booking
PaymentSchema.index(
  { bookingId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "VERIFIED" },
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

