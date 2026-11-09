/**
 * Standalone CLI Database Seeder
 * Run with: npm run seed
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const DEFAULT_MESS_MENU = [
  {
    dayOfWeek: "Monday",
    dayOffset: 0,
    meals: [
      { mealType: "BREAKFAST", description: "Aloo Paratha with Curd, Pickle, and Hot Tea", options: [], isAvailable: true },
      { mealType: "LUNCH", description: "Rajma Masala, Steamed Rice, Roti, Seasonal Veg, Salad, and Papad", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Dal Makhani, Jeera Rice, Chapati, Matar Paneer or Mix Veg, Gulab Jamun", options: [{ label: "Matar Paneer", description: "Cottage cheese and peas in tomato gravy" }, { label: "Mix Veg", description: "Assorted seasonal vegetables" }], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Tuesday",
    dayOffset: 1,
    meals: [
      { mealType: "BREAKFAST", description: "Idli & Vada with Sambar, Coconut Chutney, and Coffee", options: [], isAvailable: true },
      { mealType: "LUNCH", description: "Chole Bhature / Rice, Boondi Raita, Onion Salad, and Pickle", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Yellow Dal Tadka, Seasonal Sabzi, Phulka, Steamed Rice, and Kheer", options: [], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Wednesday",
    dayOffset: 2,
    meals: [
      { mealType: "BREAKFAST", description: "Poha with Roasted Peanuts, Sev, and Masala Chai", options: [{ label: "Boiled Eggs (2 pcs)", description: "Two hard-boiled eggs" }, { label: "Fresh Fruit", description: "Seasonal fruit" }], isAvailable: true },
      { mealType: "LUNCH", description: "Kadhi Pakora, Plain Rice, Aloo Gobi Dry, Roti, and Salad", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Special Dinner: Rice, Naan/Roti, Dal Fry, with Choice of Protein", options: [{ label: "Butter Chicken", description: "Chicken in creamy tomato butter sauce" }, { label: "Paneer Butter Masala", description: "Paneer in creamy tomato butter sauce" }], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Thursday",
    dayOffset: 3,
    meals: [
      { mealType: "BREAKFAST", description: "Masala Dosa with Sambar and Chutney, Tea", options: [], isAvailable: true },
      { mealType: "LUNCH", description: "Dal Fry, Jeera Rice, Bhindi Do Pyaza, Chapati, Curd, and Salad", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Mix Dal, Vegetable Pulao, Roti, Paneer Bhurji / Soya Chaap, Ice Cream", options: [{ label: "Paneer Bhurji", description: "Scrambled spiced cottage cheese" }, { label: "Soya Chaap Curry", description: "Soya chaap in masala gravy" }], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Friday",
    dayOffset: 4,
    meals: [
      { mealType: "BREAKFAST", description: "Veg Sandwich / Bread Butter Jam, Sprouts, Tea", options: [{ label: "Boiled Egg (2 pcs)", description: "Two hard-boiled eggs" }, { label: "Sprouts Salad", description: "Moong and chana sprouts" }], isAvailable: true },
      { mealType: "LUNCH", description: "Veg Biryani, Mirchi Ka Salan, Onion Raita, Papad, and Pickle", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Special Dinner: Biryani/Pulao, Roti, Raita, with choice of Curry", options: [{ label: "Egg Curry (2 Eggs)", description: "Boiled eggs in tomato gravy" }, { label: "Paneer Lababdar", description: "Paneer in spicy cashew gravy" }], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Saturday",
    dayOffset: 5,
    meals: [
      { mealType: "BREAKFAST", description: "Poori with Aloo Sabzi, Pickle, Halwa, and Tea", options: [], isAvailable: true },
      { mealType: "LUNCH", description: "Rajma Masala / Dal Tadka, Steamed Rice, Chapati, Aloo Jeera, Salad", options: [], isAvailable: true },
      { mealType: "DINNER", description: "Pav Bhaji with Butter Pav, Extra Onions, Lemon, and Sweet", options: [{ label: "Standard Pav Bhaji", description: "Spiced vegetable mash" }, { label: "Cheese Pav Bhaji", description: "Pav bhaji with cheese" }], isAvailable: true },
    ],
  },
  {
    dayOfWeek: "Sunday",
    dayOffset: 6,
    meals: [
      { mealType: "BREAKFAST", description: "Chole Kulche / Bhature with Pickle, Sweet Lassi", options: [], isAvailable: true },
      { mealType: "LUNCH", description: "Sunday Feast: Chicken Curry or Shahi Paneer, Jeera Rice, Tandoori Roti, Dal, Raita, Ice Cream", options: [{ label: "Chicken Curry", description: "Homestyle chicken curry" }, { label: "Shahi Paneer", description: "Paneer in cashew cream gravy" }], isAvailable: true },
      { mealType: "DINNER", description: "Khichdi / Light Rice, Moong Dal Tadka, Aloo Baingan, Roti, Papad, and Fruit Custard", options: [], isAvailable: true },
    ],
  },
];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function generateBookingCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

function generateCouponCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CP-${timestamp}-${random}`;
}

function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully!\n");

  const db = mongoose.connection.db;

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword@123", salt);
  const studentPasswordHash = await bcrypt.hash("Student@123", salt);

  const usersCollection = db.collection("users");
  
  let admin = await usersCollection.findOne({ role: "ADMIN" });
  if (!admin) {
    const res = await usersCollection.insertOne({
      name: "Mess Administrator",
      rollNumber: "ADMIN001",
      email: "admin@mess.college",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    admin = { _id: res.insertedId };
    console.log("✓ Admin created: admin@mess.college (Password: AdminPassword@123)");
  } else {
    console.log("✓ Admin exists: admin@mess.college");
  }

  let student1 = await usersCollection.findOne({ email: "student@college.edu" });
  if (!student1) {
    const res = await usersCollection.insertOne({
      name: "Aman Sharma",
      rollNumber: "21CS101",
      email: "student@college.edu",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    student1 = { _id: res.insertedId };
    console.log("✓ Student 1 created: student@college.edu (Roll: 21CS101 | Password: Student@123)");
  } else {
    console.log("✓ Student 1 exists: student@college.edu");
  }

  let student2 = await usersCollection.findOne({ email: "priya@college.edu" });
  if (!student2) {
    const res = await usersCollection.insertOne({
      name: "Priya Patel",
      rollNumber: "21CS102",
      email: "priya@college.edu",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    student2 = { _id: res.insertedId };
    console.log("✓ Student 2 created: priya@college.edu (Roll: 21CS102 | Password: Student@123)");
  } else {
    console.log("✓ Student 2 exists: priya@college.edu");
  }

  const today = new Date();
  const monday = getWeekStart(today);
  const sunday = getWeekEnd(today);

  const weeksCollection = db.collection("weeks");
  let activeWeek = await weeksCollection.findOne({
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  if (!activeWeek) {
    const bookingStart = new Date(monday);
    bookingStart.setDate(bookingStart.getDate() - 5);
    const bookingEnd = new Date(sunday);
    bookingEnd.setHours(23, 59, 59);

    const res = await weeksCollection.insertOne({
      startDate: monday,
      endDate: sunday,
      bookingStart,
      bookingEnd,
      status: "OPEN",
      createdBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    activeWeek = { _id: res.insertedId, startDate: monday, endDate: sunday };
    console.log(`✓ Active weekly cycle created: ${monday.toLocaleDateString()} to ${sunday.toLocaleDateString()} (OPEN)`);
  } else {
    await weeksCollection.updateOne({ _id: activeWeek._id }, { $set: { status: "OPEN" } });
    console.log(`✓ Active weekly cycle confirmed OPEN: ${activeWeek.startDate.toLocaleDateString()} to ${activeWeek.endDate.toLocaleDateString()}`);
  }

  const pricesCollection = db.collection("weeklyprices");
  await pricesCollection.updateOne(
    { weekId: activeWeek._id },
    {
      $set: {
        weekId: activeWeek._id,
        breakfastPrice: 25,
        lunchPrice: 45,
        dinnerPrice: 40,
        minimumBookingAmount: 300,
        updatedBy: admin._id,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("✓ Weekly prices set: Breakfast ₹25, Lunch ₹45, Dinner ₹40, Min ₹300");

  const menusCollection = db.collection("weeklymenus");
  const weekDays = DEFAULT_MESS_MENU.map((d) => {
    const dayDate = new Date(activeWeek.startDate);
    dayDate.setDate(dayDate.getDate() + d.dayOffset);
    return {
      date: dayDate,
      dayOfWeek: d.dayOfWeek,
      meals: d.meals,
    };
  });

  await menusCollection.updateOne(
    { weekId: activeWeek._id },
    {
      $set: {
        weekId: activeWeek._id,
        days: weekDays,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("✓ 7-day college mess menu seeded");

  const bookingsCollection = db.collection("bookings");
  const itemsCollection = db.collection("bookingitems");
  const couponsCollection = db.collection("coupons");
  const paymentsCollection = db.collection("payments");

  let pending = await bookingsCollection.findOne({
    studentId: student2._id,
    weekId: activeWeek._id,
  });

  if (!pending) {
    const bookingCode = generateBookingCode();
    const res = await bookingsCollection.insertOne({
      bookingCode,
      studentId: student2._id,
      weekId: activeWeek._id,
      totalAmount: 330,
      totalMeals: 9,
      status: "PENDING",
      paymentStatus: "UNVERIFIED",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const pendingId = res.insertedId;

    const sampleItems = [];
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const itemDate = new Date(activeWeek.startDate);
      itemDate.setDate(itemDate.getDate() + dayOffset);
      sampleItems.push(
        {
          bookingId: pendingId,
          studentId: student2._id,
          weekId: activeWeek._id,
          date: itemDate,
          mealType: "BREAKFAST",
          selectedOption: "",
          mealDescriptionSnapshot: "Standard Breakfast",
          priceAtBooking: 25,
          createdAt: new Date(),
        },
        {
          bookingId: pendingId,
          studentId: student2._id,
          weekId: activeWeek._id,
          date: itemDate,
          mealType: "LUNCH",
          selectedOption: "",
          mealDescriptionSnapshot: "Standard Lunch",
          priceAtBooking: 45,
          createdAt: new Date(),
        },
        {
          bookingId: pendingId,
          studentId: student2._id,
          weekId: activeWeek._id,
          date: itemDate,
          mealType: "DINNER",
          selectedOption: "Matar Paneer",
          mealDescriptionSnapshot: "Dal Makhani, Rice, Chapati, Matar Paneer",
          priceAtBooking: 40,
          createdAt: new Date(),
        }
      );
    }
    await itemsCollection.insertMany(sampleItems);
    console.log(`✓ Sample PENDING booking created for Priya (${bookingCode}, ₹330) for admin approval testing`);
  }

  let approved = await bookingsCollection.findOne({
    studentId: student1._id,
    weekId: activeWeek._id,
  });

  if (!approved) {
    const bookingCode = generateBookingCode();
    const res = await bookingsCollection.insertOne({
      bookingCode,
      studentId: student1._id,
      weekId: activeWeek._id,
      totalAmount: 380,
      totalMeals: 10,
      status: "APPROVED",
      paymentStatus: "VERIFIED",
      submittedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const approvedId = res.insertedId;

    await paymentsCollection.insertOne({
      bookingId: approvedId,
      studentId: student1._id,
      amount: 380,
      method: "CASH",
      status: "VERIFIED",
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      notes: "Demo physical cash payment verified",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const couponItems = [];
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const itemDate = new Date(activeWeek.startDate);
      itemDate.setDate(itemDate.getDate() + dayOffset);

      const itemRes = await itemsCollection.insertOne({
        bookingId: approvedId,
        studentId: student1._id,
        weekId: activeWeek._id,
        date: itemDate,
        mealType: "LUNCH",
        selectedOption: "",
        mealDescriptionSnapshot: "Feast Lunch with Special Dish",
        priceAtBooking: 45,
        createdAt: new Date(),
      });

      couponItems.push({
        couponCode: generateCouponCode(),
        verificationCode: generateVerificationCode(),
        bookingId: approvedId,
        bookingItemId: itemRes.insertedId,
        studentId: student1._id,
        weekId: activeWeek._id,
        date: itemDate,
        mealType: "LUNCH",
        mealDescriptionSnapshot: "Feast Lunch with Special Dish",
        status: "ACTIVE",
        generatedAt: new Date(),
      });
    }

    await couponsCollection.insertMany(couponItems);
    console.log(`✓ Sample APPROVED booking created for Aman (${bookingCode}, ₹380) with ${couponItems.length} active digital coupons`);
  }

  console.log("\n=================================================");
  console.log("🎉 Database initialization completed successfully!");
  console.log("=================================================");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
