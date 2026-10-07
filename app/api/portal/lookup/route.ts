import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { phone: q },
          { memberCode: { equals: q } },
        ],
      },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          include: {
            plan: true,
            payments: {
              orderBy: { paidAt: "desc" },
            },
          },
        },
        attendances: {
          orderBy: { checkInAt: "desc" },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "No member found matching phone or member code" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Member lookup error:", error);
    return NextResponse.json({ error: "Server error during lookup" }, { status: 500 });
  }
}
