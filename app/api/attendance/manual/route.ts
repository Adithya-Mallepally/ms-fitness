import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getLocalCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentShift(): string {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return "MORNING";
  if (currentHour >= 16 && currentHour < 23) return "EVENING";
  return "GENERAL";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, notes, allowOverride = false } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required." }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const latestMembership = member.memberships[0] || null;
    let membershipStatus = "EXPIRED";
    let daysRemaining = -999;

    if (latestMembership) {
      const now = new Date();
      const end = new Date(latestMembership.endDate);
      const diffMs = end.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        membershipStatus = "EXPIRED";
      } else if (daysRemaining <= 7) {
        membershipStatus = "EXPIRING_SOON";
      } else {
        membershipStatus = "ACTIVE";
      }
    }

    if (membershipStatus === "EXPIRED" && !allowOverride) {
      return NextResponse.json(
        {
          success: false,
          reason: "MEMBERSHIP_EXPIRED",
          message: "Membership is expired. Staff override or renewal required.",
          member,
        },
        { status: 403 }
      );
    }

    const todayDateStr = getLocalCurrentDateString();
    const shift = getCurrentShift();

    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        dateString: todayDateStr,
        shift,
        status: allowOverride && membershipStatus === "EXPIRED" ? "OVERRIDE" : membershipStatus === "EXPIRING_SOON" ? "WARNING_EXPIRING" : "PRESENT",
        verifiedBy: "DESK_MANUAL",
        notes: notes || "Manual front-desk check-in",
      },
    });

    return NextResponse.json({
      success: true,
      attendance,
      member: {
        id: member.id,
        memberCode: member.memberCode,
        name: `${member.firstName} ${member.lastName}`,
        phone: member.phone,
      },
    });
  } catch (error) {
    console.error("Manual attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error during manual check-in." },
      { status: 500 }
    );
  }
}
