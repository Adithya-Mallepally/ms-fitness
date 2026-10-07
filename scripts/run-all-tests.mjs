import { spawnSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function recordPass(suite, name) {
  passedCount++;
  results.push({ suite, name, status: "PASS" });
  console.log(`  \x1b[32m✔ PASS\x1b[0m: [${suite}] ${name}`);
}

function recordFail(suite, name, error) {
  failedCount++;
  results.push({ suite, name, status: "FAIL", error: error.message });
  console.error(`  \x1b[31m✖ FAIL\x1b[0m: [${suite}] ${name}`);
  console.error(`         \x1b[31m${error.message}\x1b[0m`);
}

// -------------------------------------------------------------
// Suite 1: Static Type & Schema Validation
// -------------------------------------------------------------
async function runSuite1() {
  console.log("\n\x1b[1m\x1b[36m=== SUITE 1: Static Types & Schema Validation ===\x1b[0m");

  // 1.1 TypeScript Typecheck
  try {
    const tsc = spawnSync("npx tsc --noEmit", { shell: true, encoding: "utf8" });
    assert(tsc.status === 0, `tsc exited with status ${tsc.status}: ${tsc.stderr || tsc.stdout}`);
    recordPass("Typecheck", "TypeScript compile check (tsc --noEmit) passes with 0 errors");
  } catch (err) {
    recordFail("Typecheck", "TypeScript compile check", err);
  }

  // 1.2 Prisma Schema Validation
  try {
    const prismaVal = spawnSync("npx prisma validate", { shell: true, encoding: "utf8" });
    assert(prismaVal.status === 0, `prisma validate exited with status ${prismaVal.status}`);
    recordPass("Prisma", "Prisma schema validation passes");
  } catch (err) {
    recordFail("Prisma", "Prisma schema validation", err);
  }
}

// -------------------------------------------------------------
// Suite 2: Core Domain Logic & Business Rules (Unit Tests)
// -------------------------------------------------------------
async function runSuite2() {
  console.log("\n\x1b[1m\x1b[36m=== SUITE 2: Core Domain Logic & Expiry Rules ===\x1b[0m");

  const { calculateExpiryDate, getMembershipStatus, formatINR } = await import("../lib/expiry.ts");

  // 2.1 Monthly Expiry calculation (start date + 1 calendar month - 1 day, 23:59:59.999)
  try {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const expiry = calculateExpiryDate(start, 1);
    // 1 month from Jan 1 is Feb 1, minus 1 day is Jan 31
    assert(expiry.getMonth() === 0, `Month should be January (0), got ${expiry.getMonth()}`);
    assert(expiry.getDate() === 31, `Date should be 31, got ${expiry.getDate()}`);
    assert(expiry.getHours() === 23 && expiry.getMinutes() === 59 && expiry.getSeconds() === 59, "Hours/Mins/Secs must be end-of-day");
    recordPass("BusinessRules", "Monthly plan expiry follows inclusive policy (+1 month - 1 day)");
  } catch (err) {
    recordFail("BusinessRules", "Monthly plan expiry calculation", err);
  }

  // 2.2 Quarterly (3 Months) Expiry calculation
  try {
    const start = new Date("2026-03-01T00:00:00.000Z");
    const expiry = calculateExpiryDate(start, 3);
    // 3 months from March 1 is June 1, minus 1 day is May 31
    assert(expiry.getMonth() === 4, `Month should be May (4), got ${expiry.getMonth()}`);
    assert(expiry.getDate() === 31, `Date should be 31, got ${expiry.getDate()}`);
    recordPass("BusinessRules", "3-Month plan expiry correctly calculates quarterly boundary");
  } catch (err) {
    recordFail("BusinessRules", "3-Month plan expiry calculation", err);
  }

  // 2.3 Annual (12 Months) Expiry calculation
  try {
    const start = new Date("2026-05-15T00:00:00.000Z");
    const expiry = calculateExpiryDate(start, 12);
    // 12 months from May 15, 2026 is May 15, 2027, minus 1 day is May 14, 2027
    assert(expiry.getFullYear() === 2027, `Year should be 2027, got ${expiry.getFullYear()}`);
    assert(expiry.getMonth() === 4, `Month should be May (4), got ${expiry.getMonth()}`);
    assert(expiry.getDate() === 14, `Date should be 14, got ${expiry.getDate()}`);
    recordPass("BusinessRules", "Annual plan expiry adds 12 calendar months minus 1 day");
  } catch (err) {
    recordFail("BusinessRules", "Annual plan expiry calculation", err);
  }

  // 2.4 Status Determination Logic (ACTIVE, EXPIRING <= 30d, EXPIRED)
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    const expiringDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
    const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // -5 days

    assert(getMembershipStatus(futureDate) === "ACTIVE", "60 days out should be ACTIVE");
    assert(getMembershipStatus(expiringDate) === "EXPIRING", "15 days out should be EXPIRING");
    assert(getMembershipStatus(pastDate) === "EXPIRED", "Past date should be EXPIRED");
    recordPass("BusinessRules", "getMembershipStatus accurately classifies ACTIVE, EXPIRING, and EXPIRED");
  } catch (err) {
    recordFail("BusinessRules", "Membership status evaluation", err);
  }

  // 2.5 Indian Rupee Currency Formatting
  try {
    const formatted = formatINR(14999);
    assert(formatted.includes("14,999"), `Formatted string should contain 14,999, got ${formatted}`);
    recordPass("BusinessRules", "formatINR formats amounts in Indian Numbering System");
  } catch (err) {
    recordFail("BusinessRules", "Currency formatting", err);
  }
}

// -------------------------------------------------------------
// Suite 3: Database & Seed Data Integrity Tests
// -------------------------------------------------------------
async function runSuite3() {
  console.log("\n\x1b[1m\x1b[36m=== SUITE 3: Database Schema & Seed Data Integrity ===\x1b[0m");

  // 3.1 Active Plans & Tier Configurations (SRS Table 3)
  try {
    const plans = await prisma.membershipPlan.findMany({
      include: { prices: true },
    });
    assert(plans.length >= 8, `Expected at least 8 membership plans, found ${plans.length}`);
    
    // Check categories
    const categories = new Set(plans.map(p => p.category));
    assert(categories.has("MEN"), "Missing MEN category plan");
    assert(categories.has("WOMEN"), "Missing WOMEN category plan");
    assert(categories.has("COUPLE"), "Missing COUPLE category plan");

    // Check pricing records
    for (const p of plans) {
      assert(p.prices.length >= 1, `Plan ${p.code} must have at least 1 price version`);
      assert(p.prices[0].price > 0, `Plan ${p.code} price must be > 0`);
    }
    recordPass("Database", `Found ${plans.length} plans across MEN, WOMEN, COUPLE with active price versions`);
  } catch (err) {
    recordFail("Database", "Membership plans and pricing versions check", err);
  }

  // 3.2 Members & Pass Distribution
  try {
    const members = await prisma.member.findMany({
      include: { memberships: { include: { plan: true } } },
    });
    assert(members.length >= 5, `Expected at least 5 seeded demo members, found ${members.length}`);

    // Check member code uniqueness and format
    const codes = members.map(m => m.memberCode);
    const uniqueCodes = new Set(codes);
    assert(codes.length === uniqueCodes.size, "Duplicate memberCode detected!");
    assert(codes.every(c => c.startsWith("MSF-")), "Member codes must follow MSF-xxxx pattern");

    recordPass("Database", `Verified ${members.length} members with unique MSF codes and active pass relations`);
  } catch (err) {
    recordFail("Database", "Members integrity check", err);
  }

  // 3.3 Operating Timings and Settings (SRS Table 2)
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    assert(settingsMap["timings_morning"], "Missing timings_morning setting");
    assert(settingsMap["timings_evening"], "Missing timings_evening setting");
    assert(settingsMap["timings_sunday"], "Missing timings_sunday setting");
    assert(settingsMap["receipt_prefix"], "Missing receipt_prefix setting");

    recordPass("Database", `Operating shift timings & club settings configured (Morning: ${settingsMap["timings_morning"]})`);
  } catch (err) {
    recordFail("Database", "System configuration settings check", err);
  }
}

// -------------------------------------------------------------
// Suite 4: End-to-End API Route Integration Tests
// -------------------------------------------------------------
async function runSuite4() {
  console.log("\n\x1b[1m\x1b[36m=== SUITE 4: End-to-End API Route Integration Tests ===\x1b[0m");

  // 4.1 Portal Lookup by Phone
  try {
    const res = await fetch(`${BASE_URL}/api/portal/lookup?q=9810012345`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.phone === "9810012345", `Expected phone 9810012345, got ${data.phone}`);
    assert(data.memberships.length > 0, "Member must have membership history");
    assert(data.memberships[0].payments.length > 0, "Membership must have payment history");
    recordPass("API:Portal", "GET /api/portal/lookup?q=phone returns member profile and verifiable payments");
  } catch (err) {
    recordFail("API:Portal", "GET /api/portal/lookup by phone", err);
  }

  // 4.2 Portal Lookup by Member Code
  try {
    const res = await fetch(`${BASE_URL}/api/portal/lookup?q=MSF-1001`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.memberCode === "MSF-1001", `Expected MSF-1001, got ${data.memberCode}`);
    recordPass("API:Portal", "GET /api/portal/lookup?q=code returns member profile by MSF code");
  } catch (err) {
    recordFail("API:Portal", "GET /api/portal/lookup by member code", err);
  }

  // 4.3 Portal Lookup 404 for Unknown Query
  try {
    const res = await fetch(`${BASE_URL}/api/portal/lookup?q=0000000000`);
    assert(res.status === 404, `Expected 404 for nonexistent query, got ${res.status}`);
    recordPass("API:Portal", "GET /api/portal/lookup returns 404 for unregistered user");
  } catch (err) {
    recordFail("API:Portal", "GET /api/portal/lookup negative test", err);
  }

  // 4.4 Admin Plans API
  let activePlans = [];
  try {
    const res = await fetch(`${BASE_URL}/api/admin/plans`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    activePlans = await res.json();
    assert(Array.isArray(activePlans) && activePlans.length > 0, "Plans must be a non-empty array");
    assert(activePlans[0].price > 0, "Plan price must be greater than 0");
    recordPass("API:Admin", `GET /api/admin/plans returns ${activePlans.length} active plans with current prices`);
  } catch (err) {
    recordFail("API:Admin", "GET /api/admin/plans", err);
  }

  // 4.5 Reports CSV Export API (FR-10)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/reports/export`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const contentType = res.headers.get("content-type");
    assert(contentType && contentType.includes("text/csv"), `Expected text/csv, got ${contentType}`);
    const csvText = await res.text();
    assert(csvText.includes("Receipt Number,Date,Member ID,Member Name"), "CSV missing required headers");
    recordPass("API:Admin", "GET /api/admin/reports/export returns downloadable audit CSV");
  } catch (err) {
    recordFail("API:Admin", "GET /api/admin/reports/export", err);
  }

  // 4.6 New Member Registration - Duplicate Phone Rejection (BR-02)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/members/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Duplicate",
        lastName: "Test",
        phone: "9810012345", // already used
        gender: "MEN",
        planId: activePlans[0]?.id,
        startDate: "2026-04-01",
        paymentMethod: "UPI",
      }),
    });
    assert(res.status === 409, `Expected 409 Conflict for duplicate phone, got ${res.status}`);
    const data = await res.json();
    assert(data.error && data.error.includes("already registered"), "Error message should mention already registered");
    recordPass("API:Admin", "POST /api/admin/members/new blocks duplicate phone registration");
  } catch (err) {
    recordFail("API:Admin", "POST /api/admin/members/new duplicate check", err);
  }

  // 4.7 New Member Registration - Successful Creation
  const testPhone = `999${Date.now().toString().slice(-7)}`;
  let createdMemberId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/members/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Automated",
        lastName: "Tester",
        phone: testPhone,
        email: "autotest@msfitness.club",
        gender: "MEN",
        planId: activePlans[0]?.id,
        startDate: "2026-05-01",
        paymentMethod: "UPI",
        transactionRef: "UPI-TEST-9999",
        notes: "Automated test joining",
      }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "Response success must be true");
    assert(data.data.member.memberCode.startsWith("MSF-"), "Generated code must start with MSF-");
    assert(data.data.receipt.receiptNo.startsWith("MSF-REC-"), "Generated receipt must start with MSF-REC-");
    assert(data.data.receipt.amount === activePlans[0].price, "Receipt amount must match plan price");
    createdMemberId = data.data.member.id;
    recordPass("API:Admin", `POST /api/admin/members/new successfully created member (${data.data.member.memberCode}) and issued tax receipt`);
  } catch (err) {
    recordFail("API:Admin", "POST /api/admin/members/new successful creation", err);
  }

  // 4.8 Instant Renewal API
  if (createdMemberId) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/members/${createdMemberId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: activePlans[1]?.id || activePlans[0]?.id,
          startDate: "2026-06-01",
          paymentMethod: "CASH",
          transactionRef: "CASH-DESK",
        }),
      });

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert(data.success === true, "Renewal response must have success: true");
      assert(data.receipt.receiptNo.startsWith("MSF-REC-"), "Renewal must issue new receipt");

      // Verify in DB that historical memberships are preserved
      const updatedMember = await prisma.member.findUnique({
        where: { id: createdMemberId },
        include: { memberships: true, payments: true },
      });
      assert(updatedMember.memberships.length === 2, `Expected 2 historical memberships, got ${updatedMember.memberships.length}`);
      assert(updatedMember.payments.length === 2, `Expected 2 receipts, got ${updatedMember.payments.length}`);
      recordPass("API:Admin", "POST /api/admin/members/:id/renew processed renewal, issued new receipt, and preserved history");
    } catch (err) {
      recordFail("API:Admin", "POST /api/admin/members/:id/renew", err);
    }
  }

  // 4.9 Fee Versioning Rule Update
  try {
    const targetPlan = activePlans[0];
    const originalPrice = targetPlan.price;
    const testUpdatedPrice = originalPrice + 100;

    const res = await fetch(`${BASE_URL}/api/admin/plans/update-fee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: targetPlan.id,
        newPrice: testUpdatedPrice.toString(),
        effectiveFrom: new Date().toISOString(),
      }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "Fee update success should be true");
    assert(data.newPrice.price === testUpdatedPrice, "New price must match requested price");
    assert(data.newPrice.version >= 2, "Price version must increment");

    // Clean up price version back to original to keep clean seed data
    await prisma.planPrice.delete({ where: { id: data.newPrice.id } });
    recordPass("API:Admin", `POST /api/admin/plans/update-fee created new price version without altering previous history`);
  } catch (err) {
    recordFail("API:Admin", "POST /api/admin/plans/update-fee", err);
  }

  // 4.10 Attendance QR Code Scan (Active Member)
  try {
    const activeMember = await prisma.member.findFirst({
      where: { status: "ACTIVE" },
      include: { memberships: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    assert(activeMember, "Must find an active member to test scan");

    const res = await fetch(`${BASE_URL}/api/attendance/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrData: activeMember.memberCode }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "Scan check-in must succeed");
    assert(data.attendance && data.attendance.id, "Attendance record must be generated");
    assert(data.member.memberCode === activeMember.memberCode, "Member code must match");
    recordPass("API:Attendance", `POST /api/attendance/scan successfully verified and marked attendance for active member (${activeMember.memberCode})`);
  } catch (err) {
    recordFail("API:Attendance", "POST /api/attendance/scan (Active member)", err);
  }

  // 4.11 Attendance Dynamic JSON Payload Scan & Repeat Visit Detection
  try {
    const activeMember = await prisma.member.findFirst({
      where: { status: "ACTIVE" },
    });
    assert(activeMember, "Must find an active member");

    // Dynamic payload matching DynamicQrPassModal format
    const dynamicPayload = JSON.stringify({
      app: "MS_FITNESS",
      memberCode: activeMember.memberCode,
      nonce: `test-${Date.now()}`,
      timestamp: Date.now(),
    });

    const res = await fetch(`${BASE_URL}/api/attendance/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrData: dynamicPayload }),
    });

    assert(res.status === 200, `Expected 200 for dynamic JSON pass, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "Dynamic pass scan must succeed");
    assert(data.isRepeatCheckIn === true, "Should recognize repeat entry on same day");
    recordPass("API:Attendance", "POST /api/attendance/scan verified dynamic JSON QR token & detected repeat visit");
  } catch (err) {
    recordFail("API:Attendance", "POST /api/attendance/scan (Dynamic JSON token)", err);
  }

  // 4.12 Today's Attendance Query & Shift Stats
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/today`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.attendances), "Attendances must be an array");
    assert(data.stats && typeof data.stats.total === "number", "Stats must include total");
    assert(data.stats.total >= 1, "Must have recorded at least 1 check-in today");
    recordPass("API:Attendance", `GET /api/attendance/today returned ${data.stats.total} check-ins and shift distribution stats`);
  } catch (err) {
    recordFail("API:Attendance", "GET /api/attendance/today", err);
  }

  // 4.13 Manual Reception Check-In
  try {
    const sampleMember = await prisma.member.findFirst();
    assert(sampleMember, "Must find a member for manual check-in");

    const res = await fetch(`${BASE_URL}/api/attendance/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: sampleMember.id, allowOverride: true }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "Manual check-in must succeed");
    assert(data.attendance.verifiedBy === "DESK_MANUAL", "VerifiedBy must be DESK_MANUAL");
    recordPass("API:Attendance", "POST /api/attendance/manual recorded front-desk check-in");
  } catch (err) {
    recordFail("API:Attendance", "POST /api/attendance/manual", err);
  }
}

// -------------------------------------------------------------
// Suite 5: Frontend Route & SSR Render Tests
// -------------------------------------------------------------
async function runSuite5() {
  console.log("\n\x1b[1m\x1b[36m=== SUITE 5: Frontend Route Rendering & SSR Health Checks ===\x1b[0m");

  const routes = [
    { path: "/", label: "Landing Page", expectedText: "M S FITNESS" },
    { path: "/portal", label: "Member Pass Portal", expectedText: "MEMBER PORTAL" },
    { path: "/admin", label: "Operations Dashboard", expectedText: "MANAGEMENT DASHBOARD" },
    { path: "/admin/attendance", label: "Entrance Scanner & Attendance", expectedText: "Entrance Scanner" },
    { path: "/admin/members", label: "Member Directory", expectedText: "MEMBER DIRECTORY" },
    { path: "/admin/members/new", label: "Registration Form", expectedText: "Staff ERP" },
    { path: "/admin/plans", label: "Plan Matrix & Fee Versioning", expectedText: "MEMBERSHIP PLANS" },
    { path: "/admin/renewals", label: "Renewal Pipeline", expectedText: "RENEWAL PIPELINE" },
    { path: "/admin/payments", label: "Payment Ledger", expectedText: "PAYMENT TRANSACTIONS" },
    { path: "/admin/reports", label: "Financial Reports", expectedText: "OPERATIONAL &amp; FINANCIAL REPORTS" },
    { path: "/admin/settings", label: "System Timings & Settings", expectedText: "SETTINGS &amp; TIMINGS" },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes(r.expectedText), `HTML does not contain expected text "${r.expectedText}"`);
      recordPass("SSR", `Route ${r.path} (${r.label}) rendered with HTTP 200 OK`);
    } catch (err) {
      recordFail("SSR", `Route ${r.path} (${r.label})`, err);
    }
  }

  // Test dynamic member profile route
  try {
    const sampleMember = await prisma.member.findFirst();
    if (sampleMember) {
      const res = await fetch(`${BASE_URL}/admin/members/${sampleMember.id}`);
      assert(res.status === 200, `Expected 200 for member ${sampleMember.id}, got ${res.status}`);
      const html = await res.text();
      assert(html.includes(sampleMember.memberCode), `HTML must include memberCode ${sampleMember.memberCode}`);
      recordPass("SSR", `Dynamic route /admin/members/${sampleMember.id} rendered with HTTP 200 OK`);
    }
  } catch (err) {
    recordFail("SSR", "Dynamic route /admin/members/:id", err);
  }
}

// -------------------------------------------------------------
// Main Runner Execution
// -------------------------------------------------------------
async function main() {
  const startTime = Date.now();
  console.log("\x1b[1m\x1b[35m============================================================\x1b[0m");
  console.log("\x1b[1m\x1b[35m       M S FITNESS — COMPREHENSIVE AUTOMATED TEST SUITE     \x1b[0m");
  console.log("\x1b[1m\x1b[35m============================================================\x1b[0m");
  console.log(`Target Base URL: ${BASE_URL}`);

  try {
    await runSuite1();
    await runSuite2();
    await runSuite3();
    await runSuite4();
    await runSuite5();
  } catch (fatal) {
    console.error("Fatal Test Suite Error:", fatal);
  } finally {
    await prisma.$disconnect();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = passedCount + failedCount;

  console.log("\n\x1b[1m\x1b[35m============================================================\x1b[0m");
  console.log("\x1b[1m\x1b[35m                      TEST SUMMARY                          \x1b[0m");
  console.log("\x1b[1m\x1b[35m============================================================\x1b[0m");
  console.log(`Total Assertions Run : ${total}`);
  console.log(`Passed Assertions    : \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Failed Assertions    : \x1b[${failedCount > 0 ? "31" : "32"}m${failedCount}\x1b[0m`);
  console.log(`Execution Time       : ${durationSec}s`);

  if (failedCount === 0) {
    console.log("\n\x1b[1m\x1b[32m✔ ALL PRODUCT VERIFICATION TESTS PASSED PERFECTLY!\x1b[0m\n");
    process.exit(0);
  } else {
    console.log(`\n\x1b[1m\x1b[31m✖ ${failedCount} TEST(S) FAILED.\x1b[0m\n`);
    process.exit(1);
  }
}

main();
