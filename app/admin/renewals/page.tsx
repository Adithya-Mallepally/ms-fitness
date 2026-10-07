import Link from "next/link";
import prisma from "@/lib/prisma";
import { Clock, AlertTriangle, AlertCircle, XCircle, Phone, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRenewalsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const currentTab = searchParams.tab || "URGENT"; // URGENT (7d), SOON (30d), EXPIRED

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Queries
  const [urgentExpiring, thirtyDaysExpiring, expiredList] = await Promise.all([
    // Expiring within 7 days
    prisma.membership.findMany({
      where: {
        endDate: { gte: now, lte: in7Days },
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: { member: true, plan: true },
      orderBy: { endDate: "asc" },
    }),
    // Expiring within 30 days
    prisma.membership.findMany({
      where: {
        endDate: { gte: now, lte: in30Days },
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: { member: true, plan: true },
      orderBy: { endDate: "asc" },
    }),
    // Already expired
    prisma.membership.findMany({
      where: {
        endDate: { lt: now },
      },
      include: { member: true, plan: true },
      orderBy: { endDate: "desc" },
    }),
  ]);

  const activeList =
    currentTab === "URGENT"
      ? urgentExpiring
      : currentTab === "SOON"
      ? thirtyDaysExpiring
      : expiredList;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Membership Retention &amp; Expiry Tracking
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            RENEWAL PIPELINE
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Automated tracking of upcoming membership lapses. Contact members and issue one-click renewals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/members/new"
            className="rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-colors shadow-md w-full sm:w-auto text-center"
          >
            New Registration
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        {[
          {
            key: "URGENT",
            label: "Urgent: < 7 Days",
            count: urgentExpiring.length,
            badgeColor: "bg-crimson-500/10 text-crimson-600 dark:text-crimson-400 border-crimson-500/30",
          },
          {
            key: "SOON",
            label: "30-Day Window",
            count: thirtyDaysExpiring.length,
            badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          },
          {
            key: "EXPIRED",
            label: "Lapsed / Expired",
            count: expiredList.length,
            badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
          },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/renewals?tab=${tab.key}`}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${
              currentTab === tab.key
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md shadow-zinc-950/10"
                : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${tab.badgeColor}`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Pipeline Members Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-4 px-6">Member Name &amp; Code</th>
                <th className="py-4 px-6">Current Enrolled Plan</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Remaining Days</th>
                <th className="py-4 px-6">Contact / Phone</th>
                <th className="py-4 px-6 text-right">Renewal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
              {activeList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                    No members currently in this expiry queue.
                  </td>
                </tr>
              ) : (
                activeList.map((item) => {
                  const daysLeft = Math.ceil(
                    (new Date(item.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-zinc-950 dark:text-white text-sm">
                          {item.member.firstName} {item.member.lastName}
                        </p>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {item.member.memberCode}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium text-zinc-900 dark:text-white">{item.plan.name}</span>
                        <span className="block text-[10px] text-gold-600 dark:text-gold-500 font-mono font-medium">
                          {item.plan.durationMonths} Month Duration
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono text-zinc-700 dark:text-zinc-300">
                        {new Date(item.endDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-6">
                        {daysLeft > 0 ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              daysLeft <= 7
                                ? "bg-crimson-500/20 text-crimson-400 border border-crimson-500/40"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            }`}
                          >
                            {daysLeft} days remaining
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono uppercase">
                            Expired {Math.abs(daysLeft)}d ago
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <a
                          href={`tel:${item.member.phone}`}
                          className="inline-flex items-center gap-1.5 font-mono text-zinc-300 hover:text-gold-400 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{item.member.phone}</span>
                        </a>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/members/${item.member.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold-500 text-black font-bold uppercase tracking-wider text-[11px] hover:bg-gold-400 transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          <span>Process Renewal</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
