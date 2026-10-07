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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date") || getLocalCurrentDateString();

    const attendances = await prisma.attendance.findMany({
      where: {
        dateString: dateQuery,
      },
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            firstName: true,
            lastName: true,
            phone: true,
            gender: true,
            photoUrl: true,
            memberships: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                plan: true,
              },
            },
          },
        },
      },
      orderBy: { checkInAt: "desc" },
    });

    const total = attendances.length;
    const morningCount = attendances.filter((a) => a.shift === "MORNING").length;
    const eveningCount = attendances.filter((a) => a.shift === "EVENING").length;
    const generalCount = attendances.filter((a) => a.shift === "GENERAL").length;
    const expiringWarnings = attendances.filter((a) => a.status === "WARNING_EXPIRING").length;
    const overrides = attendances.filter((a) => a.status === "OVERRIDE").length;

    // Unique members who visited today
    const uniqueMembers = new Set(attendances.map((a) => a.memberId)).size;

    return NextResponse.json({
      date: dateQuery,
      attendances,
      stats: {
        total,
        uniqueMembers,
        morningCount,
        eveningCount,
        generalCount,
        expiringWarnings,
        overrides,
      },
    });
  } catch (error) {
    console.error("Attendance today lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching today's attendance." },
      { status: 500 }
    );
  }
}
