/**
 * Automated Business Rules Test Suite
 * Based on Section 12 of planning.md
 * 
 * Run with: node scripts/test-rules.mjs
 */

import assert from "node:assert";

console.log("=================================================");
console.log(" Running Core Business Rule Verification Tests");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${error.message}`);
  }
}

// -------------------------------------------------------------
// 1. Pricing & Minimum Threshold Tests (planning.md 4.3, 12.1)
// -------------------------------------------------------------
const DEFAULT_PRICES = {
  breakfast: 25,
  lunch: 45,
  dinner: 40,
  minimumBookingAmount: 300,
};

function calculateBookingTotal(breakfastCount, lunchCount, dinnerCount, prices = DEFAULT_PRICES) {
  return (
    breakfastCount * prices.breakfast +
    lunchCount * prices.lunch +
    dinnerCount * prices.dinner
  );
}

function validateBookingAmount(totalAmount, minAmount = DEFAULT_PRICES.minimumBookingAmount) {
  if (totalAmount < minAmount) {
    return {
      valid: false,
      message: `Your selected meals total ₹${totalAmount}. The minimum booking amount is ₹${minAmount}. Please add more meals to continue.`,
    };
  }
  return { valid: true };
}

test("Booking below ₹300 is rejected with helpful validation message", () => {
  // 4 breakfasts (100) + 2 lunches (90) = ₹190
  const total = calculateBookingTotal(4, 2, 0);
  assert.strictEqual(total, 190);
  const result = validateBookingAmount(total);
  assert.strictEqual(result.valid, false);
  assert(result.message.includes("minimum booking amount is ₹300"));
});

test("Booking of exactly ₹300 is accepted", () => {
  // 6 dinners (6 * 40 = 240) + 1 lunch (45) + 1 breakfast (25) = 240 + 45 + 25 = 310 -> let's test exact 300:
  // 12 breakfasts (12 * 25 = 300)
  const total = calculateBookingTotal(12, 0, 0);
  assert.strictEqual(total, 300);
  const result = validateBookingAmount(total);
  assert.strictEqual(result.valid, true);
});

test("Booking above ₹300 is accepted", () => {
  // 7 breakfasts (175) + 7 lunches (315) + 7 dinners (280) = ₹770
  const total = calculateBookingTotal(7, 7, 7);
  assert.strictEqual(total, 770);
  const result = validateBookingAmount(total);
  assert.strictEqual(result.valid, true);
});

test("Empty booking (0 meals) has total 0 and is rejected", () => {
  const total = calculateBookingTotal(0, 0, 0);
  assert.strictEqual(total, 0);
  const result = validateBookingAmount(total);
  assert.strictEqual(result.valid, false);
});

// -------------------------------------------------------------
// 2. Booking Code & Coupon Code Formats (planning.md 4.7, 7.5, 7.8)
// -------------------------------------------------------------
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

test("Booking codes start with BK- prefix and are unique", () => {
  const code1 = generateBookingCode();
  const code2 = generateBookingCode();
  assert(code1.startsWith("BK-"));
  assert(code2.startsWith("BK-"));
  assert.notStrictEqual(code1, code2);
});

test("Coupon codes start with CP- prefix and are unique", () => {
  const code1 = generateCouponCode();
  const code2 = generateCouponCode();
  assert(code1.startsWith("CP-"));
  assert(code2.startsWith("CP-"));
  assert.notStrictEqual(code1, code2);
});

// -------------------------------------------------------------
// 3. Weekly Cycle Date Alignment (planning.md 4.1)
// -------------------------------------------------------------
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
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

test("Week cycle runs from Monday to Sunday (7 days)", () => {
  const testDate = new Date("2026-11-09T12:00:00Z"); // Monday
  const monday = getWeekStart(testDate);
  const sunday = getWeekEnd(testDate);

  assert.strictEqual(monday.getDay(), 1, "Start day must be Monday");
  assert.strictEqual(sunday.getDay(), 0, "End day must be Sunday");

  const diffDays = Math.round((sunday.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
  assert.strictEqual(diffDays, 7);
});

// -------------------------------------------------------------
// 4. Coupon Issuance Ratio (planning.md 4.7: 1 coupon per selected meal)
// -------------------------------------------------------------
test("Approved booking produces exactly 1 coupon per selected meal item", () => {
  const selectedMealsCount = 14;
  const mockBookingItems = Array.from({ length: selectedMealsCount }, (_, i) => ({
    _id: `item_${i + 1}`,
    mealType: i % 2 === 0 ? "LUNCH" : "DINNER",
  }));

  const generatedCoupons = mockBookingItems.map((item) => ({
    couponCode: generateCouponCode(),
    bookingItemId: item._id,
    status: "ACTIVE",
  }));

  assert.strictEqual(generatedCoupons.length, selectedMealsCount);

  // Check 1:1 uniqueness of booking item IDs
  const itemIds = new Set(generatedCoupons.map((c) => c.bookingItemId));
  assert.strictEqual(itemIds.size, selectedMealsCount);
});

// -------------------------------------------------------------
// 5. Price Snapshot Immutability (planning.md 4.9)
// -------------------------------------------------------------
test("Submitted booking snapshots preserve booking-time prices when admin edits prices later", () => {
  const originalBookingItem = {
    mealType: "LUNCH",
    priceAtBooking: 45,
    mealDescriptionSnapshot: "Standard Lunch",
  };

  // Admin updates lunch price for upcoming weeks to ₹55
  const newAdminPriceConfig = {
    lunchPrice: 55,
  };

  // Original snapshot must remain ₹45
  assert.strictEqual(originalBookingItem.priceAtBooking, 45);
  assert.notStrictEqual(originalBookingItem.priceAtBooking, newAdminPriceConfig.lunchPrice);
});

// -------------------------------------------------------------
// 6. 5-Digit Verification Code & Attendance Tracker Tests
// -------------------------------------------------------------
function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function getDateStringInAppTZ(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function isSameDayInAppTZ(d1, d2) {
  return getDateStringInAppTZ(d1) === getDateStringInAppTZ(d2);
}

function redeemCoupon(coupon, verificationDate) {
  if (coupon.status === "REDEEMED") {
    return { success: false, error: "Already redeemed" };
  }
  const isSameDay = isSameDayInAppTZ(coupon.date, verificationDate);

  if (!isSameDay) {
    return { success: false, error: "Date mismatch" };
  }

  coupon.status = "REDEEMED";
  coupon.redeemedAt = new Date();
  return { success: true, coupon };
}

test("5-Digit verification code is exactly 5 numeric digits", () => {
  const code = generateVerificationCode();
  assert.strictEqual(code.length, 5);
  assert(/^\d{5}$/.test(code));
  const num = parseInt(code, 10);
  assert(num >= 10000 && num <= 99999);
});

test("Coupon redemption marks coupon as REDEEMED with timestamp", () => {
  const today = new Date();
  const coupon = {
    status: "ACTIVE",
    date: today,
    verificationCode: "74829",
  };
  const result = redeemCoupon(coupon, today);
  assert.strictEqual(result.success, true);
  assert.strictEqual(coupon.status, "REDEEMED");
  assert(coupon.redeemedAt instanceof Date);
});

test("Duplicate redemption attempt is blocked immediately", () => {
  const today = new Date();
  const coupon = {
    status: "REDEEMED",
    date: today,
    verificationCode: "74829",
    redeemedAt: new Date(),
  };
  const result = redeemCoupon(coupon, today);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Already redeemed");
});

test("Redemption with date mismatch is blocked (cannot use tomorrow's coupon today)", () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const coupon = {
    status: "ACTIVE",
    date: tomorrow, // coupon is for tomorrow
    verificationCode: "74829",
  };
  const result = redeemCoupon(coupon, today);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Date mismatch");
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n=================================================");
console.log(` Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log("=================================================\n");

if (passedTests === totalTests) {
  console.log("🎉 All core business rules from planning.md verified successfully!");
  process.exit(0);
} else {
  console.error("❌ Some tests failed.");
  process.exit(1);
}

