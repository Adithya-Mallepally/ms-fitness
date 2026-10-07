import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date"); // optional YYYY-MM-DD

    const whereClause: any = {};
    if (dateQuery) {
      whereClause.dateString = dateQuery;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            memberCode: true,
            firstName: true,
            lastName: true,
            phone: true,
            gender: true,
            memberships: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { plan: true },
            },
          },
        },
      },
      orderBy: { checkInAt: "desc" },
      take: 500,
    });

    const headers = [
      "CheckIn Date",
      "CheckIn Time",
      "Member ID",
      "Member Name",
      "Phone",
      "Gender",
      "Enrolled Plan",
      "Shift",
      "Status",
      "Verification Source",
      "Notes",
    ];

    const rows = records.map((r) => {
      const checkInDate = new Date(r.checkInAt);
      const timeStr = checkInDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const planName = r.member.memberships[0]?.plan.name || "N/A";
      return [
        r.dateString,
        `"${timeStr}"`,
        r.member.memberCode,
        `"${r.member.firstName} ${r.member.lastName}"`,
        r.member.phone,
        r.member.gender,
        `"${planName}"`,
        r.shift,
        r.status,
        r.verifiedBy,
        `"${(r.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ms-fitness-attendance-${dateQuery || "all"}.csv"`,
      },
    });
  } catch (error) {
    console.error("Attendance export error:", error);
    return NextResponse.json({ error: "Failed to export attendance CSV." }, { status: 500 });
  }
}
