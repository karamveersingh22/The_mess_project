import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookingItem extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  weekId: mongoose.Types.ObjectId;
  date: Date;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  selectedOption: string;
  mealDescriptionSnapshot: string;
  priceAtBooking: number;
  createdAt: Date;
}

const BookingItemSchema = new Schema<IBookingItem>(
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
    selectedOption: {
      type: String,
      default: "",
      trim: true,
    },
    mealDescriptionSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    priceAtBooking: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
BookingItemSchema.index({ bookingId: 1 });
BookingItemSchema.index({ studentId: 1, date: 1 });
// Unique: one meal type per date per booking
BookingItemSchema.index(
  { bookingId: 1, date: 1, mealType: 1 },
  { unique: true }
);

const BookingItem: Model<IBookingItem> =
  mongoose.models.BookingItem ||
  mongoose.model<IBookingItem>("BookingItem", BookingItemSchema);

export default BookingItem;

