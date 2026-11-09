import mongoose, { Schema, Document, Model } from "mongoose";

export type WeekStatus = "UPCOMING" | "OPEN" | "CLOSED";

export interface IWeek extends Document {
  _id: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  bookingStart: Date;
  bookingEnd: Date;
  status: WeekStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WeekSchema = new Schema<IWeek>(
  {
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    bookingStart: {
      type: Date,
      required: [true, "Booking start time is required"],
    },
    bookingEnd: {
      type: Date,
      required: [true, "Booking end time is required"],
    },
    status: {
      type: String,
      enum: ["UPCOMING", "OPEN", "CLOSED"],
      default: "UPCOMING",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WeekSchema.index({ status: 1 });
WeekSchema.index({ startDate: 1, endDate: 1 });

const Week: Model<IWeek> =
  mongoose.models.Week || mongoose.model<IWeek>("Week", WeekSchema);

export default Week;

