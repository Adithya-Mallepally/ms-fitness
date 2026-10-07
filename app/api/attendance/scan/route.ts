import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMembershipStatus } from "@/lib/expiry";

export const dynamic = "force-dynamic";

function getLocalCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentShift(): { shift: string; label: string } {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return { shift: "MORNING", label: "Morning Shift (5:00 AM – 11:59 AM)" };
  } else if (currentHour >= 16 && currentHour < 23) {
    return { shift: "EVENING", label: "Evening Shift (4:00 PM – 10:59 PM)" };
  } else {
    return { shift: "GENERAL", label: "General Hours" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrData, verifiedBy = "QR_SCANNER", allowOverride = false, notes } = body;

    if (!qrData || typeof qrData !== "string") {
      return NextResponse.json(
        { error: "Invalid scan payload. QR code data is required." },
        { status: 400 }
      );
    }

    let searchTarget = qrData.trim();

    // 1. Check if payload is serialized JSON (from dynamic pass)
    if (searchTarget.startsWith("{") && searchTarget.endsWith("}")) {
      try {
        const parsed = JSON.parse(searchTarget);
        searchTarget = parsed.memberCode || parsed.code || parsed.phone || parsed.memberId || searchTarget;
      } catch {
        // Fall back to raw string
      }
    } else if (searchTarget.startsWith("MSF-PASS:")) {
      // Format: MSF-PASS:<memberCode>:<nonce>:<timestamp>
      const parts = searchTarget.split(":");
      if (parts.length >= 2 && parts[1]) {
        searchTarget = parts[1];
      }
    }

    // 2. Lookup member in database
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { memberCode: { equals: searchTarget } },
          { phone: { equals: searchTarget } },
          { id: { equals: searchTarget } },
        ],
      },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            plan: true,
            price: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "Member not recognized. Unregistered QR code or invalid Member ID.",
          recognized: false,
        },
        { status: 404 }
      );
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

    // Check if membership is expired and override was not explicitly approved by staff
    if (membershipStatus === "EXPIRED" && !allowOverride) {
      return NextResponse.json(
        {
          success: false,
          reason: "MEMBERSHIP_EXPIRED",
          message: latestMembership
            ? `Membership expired on ${new Date(latestMembership.endDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}. Renewal required before gym entrance.`
            : "No active membership plan found for this account. Renewal required.",
          member: {
            id: member.id,
            memberCode: member.memberCode,
            name: `${member.firstName} ${member.lastName}`,
            phone: member.phone,
            gender: member.gender,
          },
          membership: latestMembership,
          daysRemaining,
          requiresOverride: true,
        },
        { status: 403 }
      );
    }

    const todayDateStr = getLocalCurrentDateString();
    const { shift, label: shiftLabel } = getCurrentShift();

    // 3. Check for previous check-ins today
    const existingCheckIns = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
        dateString: todayDateStr,
      },
      orderBy: { checkInAt: "desc" },
    });

    const isRepeatCheckIn = existingCheckIns.length > 0;
    const firstCheckInToday = existingCheckIns.length > 0 ? existingCheckIns[existingCheckIns.length - 1] : null;

    // 4. Record new attendance record
    const attendanceRecord = await prisma.attendance.create({
      data: {
        memberId: member.id,
        dateString: todayDateStr,
        shift,
        status: allowOverride && membershipStatus === "EXPIRED" ? "OVERRIDE" : membershipStatus === "EXPIRING_SOON" ? "WARNING_EXPIRING" : "PRESENT",
        verifiedBy,
        notes: notes || (isRepeatCheckIn ? `Repeat admission on same day (#${existingCheckIns.length + 1})` : null),
      },
    });

    return NextResponse.json({
      success: true,
      membershipStatus,
      daysRemaining,
      isRepeatCheckIn,
      shift,
      shiftLabel,
      attendance: attendanceRecord,
      previousCheckInsCount: existingCheckIns.length,
      firstCheckInTime: firstCheckInToday ? firstCheckInToday.checkInAt : attendanceRecord.checkInAt,
      member: {
        id: member.id,
        memberCode: member.memberCode,
        firstName: member.firstName,
        lastName: member.lastName,
        name: `${member.firstName} ${member.lastName}`,
        phone: member.phone,
        gender: member.gender,
        photoUrl: member.photoUrl,
      },
      membership: latestMembership
        ? {
            id: latestMembership.id,
            planName: latestMembership.plan.name,
            durationMonths: latestMembership.plan.durationMonths,
            startDate: latestMembership.startDate,
            endDate: latestMembership.endDate,
            daysRemaining,
          }
        : null,
    });
  } catch (error) {
    console.error("Attendance scan verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during attendance verification." },
      { status: 500 }
    );
  }
}
