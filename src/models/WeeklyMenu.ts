import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMealOption {
  label: string;
  description: string;
}

export interface IMeal {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  description: string;
  options: IMealOption[];
  isAvailable: boolean;
}

export interface IDayMenu {
  date: Date;
  dayOfWeek: string;
  meals: IMeal[];
}

export interface IWeeklyMenu extends Document {
  _id: mongoose.Types.ObjectId;
  weekId: mongoose.Types.ObjectId;
  days: IDayMenu[];
  createdAt: Date;
  updatedAt: Date;
}

const MealOptionSchema = new Schema<IMealOption>(
  {
    label: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    mealType: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "DINNER"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    options: { type: [MealOptionSchema], default: [] },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const DayMenuSchema = new Schema<IDayMenu>(
  {
    date: { type: Date, required: true },
    dayOfWeek: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    meals: {
      type: [MealSchema],
      required: true,
      validate: {
        validator: function (meals: IMeal[]) {
          return meals.length > 0 && meals.length <= 3;
        },
        message: "Each day must have between 1 and 3 meals",
      },
    },
  },
  { _id: false }
);

const WeeklyMenuSchema = new Schema<IWeeklyMenu>(
  {
    weekId: {
      type: Schema.Types.ObjectId,
      ref: "Week",
      required: true,
      unique: true,
    },
    days: {
      type: [DayMenuSchema],
      required: true,
      validate: {
        validator: function (days: IDayMenu[]) {
          return days.length === 7;
        },
        message: "Weekly menu must have exactly 7 days",
      },
    },
  },
  {
    timestamps: true,
  }
);

const WeeklyMenu: Model<IWeeklyMenu> =
  mongoose.models.WeeklyMenu ||
  mongoose.model<IWeeklyMenu>("WeeklyMenu", WeeklyMenuSchema);

export default WeeklyMenu;

