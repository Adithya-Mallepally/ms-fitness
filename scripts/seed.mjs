import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding M S Fitness database...");

  // 1. Settings
  const settings = [
    { key: "gym_name", value: "M S FITNESS", category: "BRANDING", description: "Official gym brand name" },
    { key: "tagline", value: "ELEVATE YOUR STANDARD — LUXURY MEETS RAW POWER", category: "BRANDING", description: "Gym tagline" },
    { key: "timings_morning", value: "5:00 AM – 10:00 AM", category: "TIMINGS", description: "Morning session hours" },
    { key: "timings_evening", value: "5:00 PM – 10:00 PM", category: "TIMINGS", description: "Evening session hours" },
    { key: "timings_sunday", value: "5:00 AM – 10:00 AM (Morning Only)", category: "TIMINGS", description: "Sunday operating hours" },
    { key: "contact_phone", value: "+91 98765 43210", category: "CONTACT", description: "Front desk phone" },
    { key: "contact_email", value: "reception@msfitness.club", category: "CONTACT", description: "Official contact email" },
    { key: "address", value: "Apex Tower, 4th Floor, High Street District", category: "CONTACT", description: "Facility location" },
    { key: "receipt_prefix", value: "MSF-REC", category: "BILLING", description: "Receipt number prefix" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Staff Users
  const users = [
    { name: "Super Administrator", email: "admin@msfitness.com", password: "admin123", role: "SUPER_ADMIN" },
    { name: "Front Desk Staff", email: "reception@msfitness.com", password: "reception123", role: "RECEPTIONIST" },
    { name: "Floor Manager", email: "manager@msfitness.com", password: "manager123", role: "MANAGER" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  // 3. Membership Plans & Base Pricing Architecture
  const plansData = [
    {
      code: "MEN-1M",
      name: "Men Monthly Membership",
      category: "MEN",
      durationMonths: 1,
      price: 1700,
      description: "Full access to Men's Studio, free weights, strength lab & evening sauna.",
    },
    {
      code: "MEN-3M",
      name: "Men 3 Months Membership",
      category: "MEN",
      durationMonths: 3,
      price: 4499,
      description: "Quarterly transformation tier including body composition analysis.",
    },
    {
      code: "MEN-6M",
      name: "Men 6 Months Membership",
      category: "MEN",
      durationMonths: 6,
      price: 8499,
      description: "Semi-annual high-performance membership with locker & recovery credits.",
    },
    {
      code: "MEN-12M",
      name: "Men Annual Elite Membership",
      category: "MEN",
      durationMonths: 12,
      price: 14999,
      description: "Unrestricted 365-day access, priority studio booking & guest passes.",
    },
    {
      code: "WOM-1M",
      name: "Women Monthly Membership",
      category: "WOMEN",
      durationMonths: 1,
      price: 999,
      description: "Dedicated women's zone access, Pilates & functional turf sessions.",
    },
    {
      code: "WOM-3M",
      name: "Women 3 Months Membership",
      category: "WOMEN",
      durationMonths: 3,
      price: 2599,
      description: "Quarterly wellness pass with trainer onboarding & nutrition guidance.",
    },
    {
      code: "WOM-6M",
      name: "Women 6 Months Membership",
      category: "WOMEN",
      durationMonths: 6,
      price: 4499,
      description: "Semi-annual studio access with cold plunge & infrared recovery.",
    },
    {
      code: "WOM-12M",
      name: "Women Annual VIP Membership",
      category: "WOMEN",
      durationMonths: 12,
      price: 6999,
      description: "Full 365-day luxury wellness membership with unlimited classes.",
    },
    {
      code: "COUPLE-1M",
      name: "Couple Dual Access Pass",
      category: "COUPLE",
      durationMonths: 1,
      price: 1999,
      description: "Partner fitness package with coordinated access to all studios.",
    },
  ];

  const planPriceMap = new Map();

  for (const p of plansData) {
    const plan = await prisma.membershipPlan.upsert({
      where: { code: p.code },
      update: { name: p.name, category: p.category, durationMonths: p.durationMonths, description: p.description },
      create: {
        code: p.code,
        name: p.name,
        category: p.category,
        durationMonths: p.durationMonths,
        description: p.description,
      },
    });

    // Create initial price version
    let priceRecord = await prisma.planPrice.findFirst({
      where: { planId: plan.id, version: 1 },
    });

    if (!priceRecord) {
      priceRecord = await prisma.planPrice.create({
        data: {
          planId: plan.id,
          price: p.price,
          version: 1,
          createdBy: "Initial Seed",
        },
      });
    }

    planPriceMap.set(p.code, { plan, priceRecord });
  }

  // 4. Sample Members (From SRS Table 16 + Test Cases)
  const today = new Date();
  
  // Calculate relative dates for testing expiry filters
  const makeDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d;
  };

  const membersToCreate = [
    {
      code: "MSF-1001",
      firstName: "Rahul",
      lastName: "Kumar",
      phone: "9810012345",
      email: "rahul.kumar@gmail.com",
      gender: "MEN",
      planCode: "MEN-12M",
      startDate: makeDate(-30),
      endDate: makeDate(335), // Active (approx 11 months left)
      status: "ACTIVE",
      amount: 14999,
      method: "UPI",
      ref: "UPI-IND-88291",
    },
    {
      code: "MSF-1002",
      firstName: "Arjun",
      lastName: "Reddy",
      phone: "9820023456",
      email: "arjun.reddy@yahoo.com",
      gender: "MEN",
      planCode: "MEN-6M",
      startDate: makeDate(-45),
      endDate: makeDate(135), // Active
      status: "ACTIVE",
      amount: 8499,
      method: "CARD",
      ref: "POS-TXN-49102",
    },
    {
      code: "MSF-1003",
      firstName: "Priya",
      lastName: "Sharma",
      phone: "9830034567",
      email: "priya.sharma@outlook.com",
      gender: "WOMEN",
      planCode: "WOM-3M",
      startDate: makeDate(-75),
      endDate: makeDate(15), // Expiring in 15 days (30-day window)
      status: "EXPIRING",
      amount: 2599,
      method: "UPI",
      ref: "UPI-GPAY-77210",
    },
    {
      code: "MSF-1004",
      firstName: "Anita",
      lastName: "Rao",
      phone: "9840045678",
      email: "anita.rao@hotmail.com",
      gender: "WOMEN",
      planCode: "WOM-1M",
      startDate: makeDate(-40),
      endDate: makeDate(-10), // Expired 10 days ago
      status: "EXPIRED",
      amount: 999,
      method: "CASH",
      ref: "CASH-REC-004",
    },
    {
      code: "MSF-1005",
      firstName: "Vikram",
      lastName: "Malhotra",
      phone: "9850056789",
      email: "vikram.m@gmail.com",
      gender: "MEN",
      planCode: "MEN-1M",
      startDate: makeDate(-26),
      endDate: makeDate(4), // Expiring in 4 days (7-day urgent alert window)
      status: "EXPIRING",
      amount: 1700,
      method: "UPI",
      ref: "UPI-PAYTM-66124",
    },
    {
      code: "MSF-1006",
      firstName: "Sneha",
      lastName: "Patel",
      phone: "9860067890",
      email: "sneha.p@gmail.com",
      gender: "WOMEN",
      planCode: "WOM-12M",
      startDate: makeDate(-15),
      endDate: makeDate(350), // Active
      status: "ACTIVE",
      amount: 6999,
      method: "CARD",
      ref: "POS-TXN-99120",
    },
    {
      code: "MSF-1007",
      firstName: "Karan & Neha",
      lastName: "Verma",
      phone: "9870078901",
      email: "vermas@gmail.com",
      gender: "COUPLE",
      planCode: "COUPLE-1M",
      startDate: makeDate(-10),
      endDate: makeDate(20), // Active (expiring in 20d)
      status: "EXPIRING",
      amount: 1999,
      method: "UPI",
      ref: "UPI-PHONPE-33219",
    },
  ];

  let receiptCounter = 101;
  for (const m of membersToCreate) {
    const existing = await prisma.member.findUnique({
      where: { phone: m.phone },
    });
    if (!existing) {
      const planObj = planPriceMap.get(m.planCode);
      const member = await prisma.member.create({
        data: {
          memberCode: m.code,
          firstName: m.firstName,
          lastName: m.lastName,
          phone: m.phone,
          email: m.email,
          gender: m.gender,
          status: m.status,
        },
      });

      const membership = await prisma.membership.create({
        data: {
          memberId: member.id,
          planId: planObj.plan.id,
          priceId: planObj.priceRecord.id,
          startDate: m.startDate,
          endDate: m.endDate,
          amountPaid: m.amount,
          status: m.status,
          source: "NEW_JOIN",
        },
      });

      const recNo = `MSF-REC-2026-${m.code.replace("MSF-", "")}`;
      await prisma.payment.upsert({
        where: { receiptNo: recNo },
        update: {},
        create: {
          receiptNo: recNo,
          memberId: member.id,
          membershipId: membership.id,
          amount: m.amount,
          paymentMethod: m.method,
          transactionRef: m.ref,
          status: "PAID",
          paidAt: m.startDate,
          createdBy: "Front Desk Staff",
          notes: "Initial registration payment",
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
