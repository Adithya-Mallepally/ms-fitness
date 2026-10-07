import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { active: true },
      include: {
        prices: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
      orderBy: [{ category: "asc" }, { durationMonths: "asc" }],
    });

    const formatted = plans.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      durationMonths: p.durationMonths,
      price: p.prices[0]?.price || 0,
      priceId: p.prices[0]?.id || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
