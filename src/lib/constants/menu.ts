import { DAYS_OF_WEEK } from "@/types";

export interface SeedMeal {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  description: string;
  options: { label: string; description: string }[];
  isAvailable: boolean;
}

export interface SeedDay {
  dayOfWeek: (typeof DAYS_OF_WEEK)[number];
  dayOffset: number; // 0 for Monday, 6 for Sunday
  meals: SeedMeal[];
}

export const DEFAULT_MESS_MENU: SeedDay[] = [
  {
    dayOfWeek: "Monday",
    dayOffset: 0,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Aloo Paratha with Curd, Pickle, and Hot Tea",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Rajma Masala, Steamed Rice, Roti, Seasonal Veg, Salad, and Papad",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Dal Makhani, Jeera Rice, Chapati, Matar Paneer or Mix Veg, Gulab Jamun",
        options: [
          { label: "Matar Paneer", description: "Cottage cheese and green peas in rich tomato gravy" },
          { label: "Mix Veg", description: "Assorted seasonal vegetables in spiced curry" },
        ],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Tuesday",
    dayOffset: 1,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Idli & Vada with Sambar, Coconut Chutney, and Coffee",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Chole Bhature / Rice, Boondi Raita, Onion Salad, and Pickle",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Yellow Dal Tadka, Seasonal Sabzi, Phulka, Steamed Rice, and Kheer",
        options: [],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Wednesday",
    dayOffset: 2,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Poha with Roasted Peanuts, Sev, and Masala Chai",
        options: [
          { label: "Boiled Eggs (2 pcs)", description: "Two hard-boiled eggs" },
          { label: "Banana / Fruit", description: "Fresh seasonal fruit" },
        ],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Kadhi Pakora, Plain Rice, Aloo Gobi Dry, Roti, and Salad",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Special Dinner: Rice, Naan/Roti, Dal Fry, with Choice of Protein",
        options: [
          { label: "Butter Chicken", description: "Tender chicken cooked in creamy tomato butter sauce" },
          { label: "Paneer Butter Masala", description: "Fresh paneer cubes in creamy tomato butter sauce" },
        ],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Thursday",
    dayOffset: 3,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Masala Dosa with Sambar and Chutney, Tea",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Dal Fry, Jeera Rice, Bhindi Do Pyaza, Chapati, Curd, and Salad",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Mix Dal, Vegetable Pulao, Roti, Paneer Bhurji / Soya Chaap, Ice Cream",
        options: [
          { label: "Paneer Bhurji", description: "Scrambled spiced cottage cheese" },
          { label: "Soya Chaap Curry", description: "Soya chaap cooked in rich masala gravy" },
        ],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Friday",
    dayOffset: 4,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Veg Sandwich / Bread Butter Jam, Boiled Egg / Sprouts, Tea",
        options: [
          { label: "Boiled Egg (2 pcs)", description: "Two hard-boiled eggs" },
          { label: "Sprouts Salad", description: "Healthy moong and chana sprouts" },
        ],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Veg Biryani, Mirchi Ka Salan, Onion Raita, Papad, and Pickle",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Special Dinner: Biryani/Pulao, Roti, Raita, with choice of Curry",
        options: [
          { label: "Egg Curry (2 Eggs)", description: "Boiled eggs in rich onion tomato gravy" },
          { label: "Paneer Lababdar", description: "Rich cottage cheese in spicy cashew gravy" },
        ],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Saturday",
    dayOffset: 5,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Poori with Aloo Sabzi, Pickle, Halwa, and Tea",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Rajma Masala / Dal Tadka, Steamed Rice, Chapati, Aloo Jeera, Salad",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Pav Bhaji with Butter Pav, Extra Onions, Lemon, and Sweet",
        options: [
          { label: "Standard Pav Bhaji", description: "Traditional spiced mixed vegetable mash" },
          { label: "Cheese Pav Bhaji", description: "Pav bhaji topped with grated cheese" },
        ],
        isAvailable: true,
      },
    ],
  },
  {
    dayOfWeek: "Sunday",
    dayOffset: 6,
    meals: [
      {
        mealType: "BREAKFAST",
        description: "Chole Kulche / Bhature with Pickle, Sweet Lassi",
        options: [],
        isAvailable: true,
      },
      {
        mealType: "LUNCH",
        description: "Sunday Feast: Chicken Curry or Shahi Paneer, Jeera Rice, Tandoori Roti, Dal, Raita, Ice Cream",
        options: [
          { label: "Chicken Curry", description: "Homestyle spicy chicken curry" },
          { label: "Shahi Paneer", description: "Rich royal paneer in cashew cream gravy" },
        ],
        isAvailable: true,
      },
      {
        mealType: "DINNER",
        description: "Khichdi / Light Rice, Moong Dal Tadka, Aloo Baingan, Roti, Papad, and Fruit Custard",
        options: [],
        isAvailable: true,
      },
    ],
  },
];
