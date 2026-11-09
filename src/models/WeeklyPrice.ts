import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeeklyPrice extends Document {
  _id: mongoose.Types.ObjectId;
  weekId: mongoose.Types.ObjectId;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  minimumBookingAmount: number;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const WeeklyPriceSchema = new Schema<IWeeklyPrice>(
  {
    weekId: {
      type: Schema.Types.ObjectId,
      ref: "Week",
      required: true,
      unique: true,
    },
    breakfastPrice: {
      type: Number,
      required: true,
      default: 25,
      min: [0, "Price cannot be negative"],
    },
    lunchPrice: {
      type: Number,
      required: true,
      default: 45,
      min: [0, "Price cannot be negative"],
    },
    dinnerPrice: {
      type: Number,
      required: true,
      default: 40,
      min: [0, "Price cannot be negative"],
    },
    minimumBookingAmount: {
      type: Number,
      required: true,
      default: 300,
      min: [0, "Minimum booking amount cannot be negative"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WeeklyPrice: Model<IWeeklyPrice> =
  mongoose.models.WeeklyPrice ||
  mongoose.model<IWeeklyPrice>("WeeklyPrice", WeeklyPriceSchema);

export default WeeklyPrice;

