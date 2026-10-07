import prisma from "@/lib/prisma";
import PaymentsClient from "./PaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { q?: string; method?: string };
}) {
  const query = searchParams.q?.trim() || "";
  const methodFilter = searchParams.method || "ALL";

  const payments = await prisma.payment.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { receiptNo: { contains: query } },
                { transactionRef: { contains: query } },
                {
                  member: {
                    OR: [
                      { firstName: { contains: query } },
                      { lastName: { contains: query } },
                      { phone: { contains: query } },
                    ],
                  },
                },
              ],
            }
          : {},
        methodFilter !== "ALL" ? { paymentMethod: methodFilter } : {},
      ],
    },
    include: {
      member: true,
      membership: {
        include: { plan: true },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return <PaymentsClient initialPayments={payments} totalCollected={totalCollected} />;
}
