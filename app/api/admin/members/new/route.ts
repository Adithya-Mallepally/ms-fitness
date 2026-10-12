import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateExpiryDate } from "@/lib/expiry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      planId,
      startDate,
      paymentMethod,
      transactionRef,
      notes,
      couponCode,
      discountAmount,
    } = body;

    // Validation
    if (!firstName || !lastName || !phone || !planId || !startDate || !paymentMethod) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Phone, Plan, Start Date, Payment Method)." },
        { status: 400 }
      );
    }

    // Check duplicate phone
    const existingMember = await prisma.member.findUnique({
      where: { phone: phone.trim() },
    });
    if (existingMember) {
      return NextResponse.json(
        { error: `Phone number ${phone} is already registered to member ${existingMember.firstName} ${existingMember.lastName} (${existingMember.memberCode}).` },
        { status: 409 }
      );
    }

    // Find Plan and active Price
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!plan || plan.prices.length === 0) {
      return NextResponse.json({ error: "Invalid membership plan selected." }, { status: 400 });
    }

    const priceRecord = plan.prices[0];
    const baseAmount = priceRecord.price;
    const validatedDiscount = typeof discountAmount === "number" && discountAmount > 0 ? discountAmount : 0;
    const finalAmount = Math.max(0, baseAmount - validatedDiscount);

    // Calculate expiry date
    const parsedStartDate = new Date(startDate);
    const calculatedEndDate = calculateExpiryDate(parsedStartDate, plan.durationMonths);

    // Generate Member Code
    const memberCount = await prisma.member.count();
    const memberCode = `MSF-${1001 + memberCount}`;

    // Generate Unique Receipt Number
    const paymentCount = await prisma.payment.count();
    const receiptNo = `MSF-REC-2026-${101 + paymentCount}`;

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          memberCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          gender: gender || "MEN",
          status: "ACTIVE",
          notes: notes || null,
        },
      });

      const membership = await tx.membership.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          priceId: priceRecord.id,
          startDate: parsedStartDate,
          endDate: calculatedEndDate,
          amountPaid: finalAmount,
          status: "ACTIVE",
          source: "NEW_JOIN",
        },
      });

      const paymentNotes = couponCode
        ? `Discount coupon ${couponCode} applied (-₹${validatedDiscount}). ${notes || ""}`.trim()
        : (notes || "Initial registration payment");

      const payment = await tx.payment.create({
        data: {
          receiptNo,
          memberId: member.id,
          membershipId: membership.id,
          amount: finalAmount,
          paymentMethod,
          transactionRef: transactionRef?.trim() || null,
          status: "PAID",
          paidAt: new Date(),
          createdBy: "Front Desk Staff",
          notes: paymentNotes,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "MEMBER_CREATED",
          entityType: "Member",
          entityId: member.id,
          newValue: JSON.stringify({ memberCode, plan: plan.name, amount: finalAmount, couponCode }),
        },
      });

      return { member, membership, payment, plan };
    });

    return NextResponse.json({
      success: true,
      data: {
        member: result.member,
        membership: result.membership,
        payment: result.payment,
        receipt: {
          receiptNo: result.payment.receiptNo,
          memberName: `${result.member.firstName} ${result.member.lastName}`,
          memberCode: result.member.memberCode,
          phone: result.member.phone,
          email: result.member.email,
          gender: result.member.gender,
          planName: result.plan.name,
          durationMonths: result.plan.durationMonths,
          amount: result.payment.amount,
          originalAmount: baseAmount,
          discountAmount: validatedDiscount,
          couponCode: couponCode || null,
          paymentMethod: result.payment.paymentMethod,
          transactionRef: result.payment.transactionRef,
          startDate: result.membership.startDate,
          endDate: result.membership.endDate,
          paidAt: result.payment.paidAt,
          notes: result.member.notes,
        },
      },
    });
  } catch (error: any) {
    console.error("New joining registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register member." }, { status: 500 });
  }
}
