import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateExpiryDate } from "@/lib/expiry";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = params.id;
    const body = await req.json();
    const { planId, startDate, paymentMethod, transactionRef } = body;

    if (!planId || !startDate || !paymentMethod) {
      return NextResponse.json(
        { error: "Plan, start date, and payment method are required for renewal." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

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
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const priceRecord = plan.prices[0];
    const amount = priceRecord.price;
    const parsedStartDate = new Date(startDate);
    const calculatedEndDate = calculateExpiryDate(parsedStartDate, plan.durationMonths);

    const paymentCount = await prisma.payment.count();
    const receiptNo = `MSF-REC-2026-${101 + paymentCount}`;

    // Execute atomic renewal transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark past active memberships as EXPIRED if applicable
      await tx.membership.updateMany({
        where: { memberId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });

      // 2. Create brand-new membership period (preserving history)
      const newMembership = await tx.membership.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          priceId: priceRecord.id,
          startDate: parsedStartDate,
          endDate: calculatedEndDate,
          amountPaid: amount,
          status: "ACTIVE",
          source: "RENEWAL",
        },
      });

      // 3. Record payment
      const payment = await tx.payment.create({
        data: {
          receiptNo,
          memberId: member.id,
          membershipId: newMembership.id,
          amount,
          paymentMethod,
          transactionRef: transactionRef || null,
          status: "PAID",
          paidAt: new Date(),
          createdBy: "Front Desk Staff",
          notes: "Membership renewal payment",
        },
      });

      // 4. Update member status to ACTIVE
      await tx.member.update({
        where: { id: memberId },
        data: { status: "ACTIVE" },
      });

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          action: "RENEWAL_COMPLETED",
          entityType: "Membership",
          entityId: newMembership.id,
          newValue: JSON.stringify({ memberId, plan: plan.name, amount, receiptNo }),
        },
      });

      return { newMembership, payment, plan };
    });

    return NextResponse.json({
      success: true,
      receipt: {
        receiptNo: result.payment.receiptNo,
        memberName: `${member.firstName} ${member.lastName}`,
        memberCode: member.memberCode,
        phone: member.phone,
        planName: result.plan.name,
        amount: result.payment.amount,
        paymentMethod: result.payment.paymentMethod,
        transactionRef: result.payment.transactionRef,
        startDate: result.newMembership.startDate,
        endDate: result.newMembership.endDate,
        paidAt: result.payment.paidAt,
      },
    });
  } catch (error: any) {
    console.error("Renewal error:", error);
    return NextResponse.json({ error: error.message || "Failed to renew membership" }, { status: 500 });
  }
}
