import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, Clock, CreditCard, RefreshCw, CheckCircle2, AlertTriangle, XCircle, User, Phone, Mail, Calendar, Printer } from "lucide-react";
import MemberProfileClient from "./MemberProfileClient";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          price: true,
          payments: {
            orderBy: { paidAt: "desc" },
          },
        },
      },
    },
  });

  if (!member) {
    notFound();
  }

  // Fetch all active plans for renewal modal
  const plans = await prisma.membershipPlan.findMany({
    where: { active: true },
    include: {
      prices: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  const formattedPlans = plans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    durationMonths: p.durationMonths,
    price: p.prices[0]?.price || 0,
  }));

  return (
    <MemberProfileClient member={member} plans={formattedPlans} />
  );
}
