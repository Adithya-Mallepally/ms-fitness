import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: true,
        membership: {
          include: { plan: true },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const headers = [
      "Receipt Number",
      "Date",
      "Member ID",
      "Member Name",
      "Phone",
      "Category",
      "Plan Name",
      "Amount (INR)",
      "Payment Method",
      "Transaction Ref",
      "Status",
    ];

    const rows = payments.map((p) => [
      p.receiptNo,
      new Date(p.paidAt).toISOString().split("T")[0],
      p.member.memberCode,
      `"${p.member.firstName} ${p.member.lastName}"`,
      p.member.phone,
      p.member.gender,
      `"${p.membership.plan.name}"`,
      p.amount,
      p.paymentMethod,
      p.transactionRef || "",
      p.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ms-fitness-collections-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
