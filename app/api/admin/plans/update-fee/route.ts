import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, newPrice, effectiveFrom } = body;

    if (!planId || !newPrice || isNaN(parseFloat(newPrice))) {
      return NextResponse.json({ error: "Valid plan ID and new price are required." }, { status: 400 });
    }

    const price = parseFloat(newPrice);
    if (price <= 0) {
      return NextResponse.json({ error: "Price must be greater than zero." }, { status: 400 });
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

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const currentPriceRecord = plan.prices[0];
    const newVersion = currentPriceRecord ? currentPriceRecord.version + 1 : 1;
    const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();

    // Execute atomic price version update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark previous price version effectiveTo date
      if (currentPriceRecord) {
        await tx.planPrice.update({
          where: { id: currentPriceRecord.id },
          data: { effectiveTo: effectiveDate },
        });
      }

      // 2. Create brand-new price version record
      const createdPrice = await tx.planPrice.create({
        data: {
          planId: plan.id,
          price,
          version: newVersion,
          effectiveFrom: effectiveDate,
          createdBy: "Super Administrator",
        },
      });

      // 3. Record Audit Log
      await tx.auditLog.create({
        data: {
          action: "FEE_UPDATED",
          entityType: "MembershipPlan",
          entityId: plan.id,
          oldValue: currentPriceRecord ? `₹${currentPriceRecord.price} (v${currentPriceRecord.version})` : "None",
          newValue: `₹${price} (v${newVersion})`,
        },
      });

      return createdPrice;
    });

    return NextResponse.json({ success: true, newPrice: result });
  } catch (error: any) {
    console.error("Fee update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update fee" }, { status: 500 });
  }
}
