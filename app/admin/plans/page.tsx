import prisma from "@/lib/prisma";
import PlansClient from "./PlansClient";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    include: {
      prices: {
        orderBy: { version: "desc" },
      },
      memberships: true,
    },
    orderBy: [{ category: "asc" }, { durationMonths: "asc" }],
  });

  return <PlansClient initialPlans={plans} />;
}
