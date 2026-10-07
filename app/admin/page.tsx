import Link from "next/link";
import prisma from "@/lib/prisma";
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import { formatINR } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Operational KPI metrics
  const [
    totalMembers,
    activeCount,
    newJoinsThisMonth,
    expiringIn30Days,
    expiringIn7Days,
    expiredCount,
    recentPayments,
    recentMembers,
    allMemberships,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.membership.count({
      where: {
        createdAt: { gte: startOfMonth },
        source: "NEW_JOIN",
      },
    }),
    prisma.membership.findMany({
      where: {
        endDate: { gte: now, lte: in30Days },
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: { member: true, plan: true },
    }),
    prisma.membership.findMany({
      where: {
        endDate: { gte: now, lte: in7Days },
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: { member: true, plan: true },
    }),
    prisma.membership.count({
      where: {
        endDate: { lt: now },
      },
    }),
    prisma.payment.findMany({
      take: 6,
      orderBy: { paidAt: "desc" },
      include: { member: true },
    }),
    prisma.member.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        memberships: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { plan: true },
        },
      },
    }),
    prisma.membership.findMany({
      include: { plan: true },
    }),
  ]);

  // Financial aggregates
  const totalRevenue = recentPayments.reduce((acc, p) => acc + p.amount, 0);

  // Plan duration distribution
  const durationCounts = {
    monthly: allMemberships.filter((m) => m.plan.durationMonths === 1).length,
    threeMonth: allMemberships.filter((m) => m.plan.durationMonths === 3).length,
    sixMonth: allMemberships.filter((m) => m.plan.durationMonths === 6).length,
    annual: allMemberships.filter((m) => m.plan.durationMonths === 12).length,
  };

  return (
    <div className="space-y-10">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Real-Time Operations
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            MANAGEMENT DASHBOARD
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Live overview of memberships, upcoming expiries, and financial collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            href="/admin/members/new"
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-transform active:scale-95 shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Joining</span>
          </Link>
          <Link
            href="/admin/renewals"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-700/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-colors"
          >
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Renewal Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Real-Time KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Active Members</span>
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-black text-zinc-950 dark:text-white">{activeCount}</span>
            <span className="text-xs text-zinc-500 font-mono">/ {totalMembers} total</span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-light">Enrolled with active facility pass</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">New Joins (This Month)</span>
            <UserPlus className="h-5 w-5 text-gold-600 dark:text-gold-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-black text-zinc-950 dark:text-white">+{newJoinsThisMonth}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Month-to-date
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-light">First-time members registered</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-amber-300 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/40 via-white to-amber-100/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/20 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Expiring In 30 Days</span>
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-black text-zinc-950 dark:text-white">{expiringIn30Days.length}</span>
            <span className="text-xs text-crimson-600 dark:text-crimson-400 font-mono font-bold">
              ({expiringIn7Days.length} urgent &lt;7d)
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-light">Follow-up needed for membership renewal</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Expired Count</span>
            <XCircle className="h-5 w-5 text-crimson-600 dark:text-crimson-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-black text-zinc-950 dark:text-white">{expiredCount}</span>
            <span className="text-xs text-zinc-500 font-mono">Inactive passes</span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-light">Eligible for one-click winback renewal</p>
        </div>
      </div>

      {/* Membership Plan Distribution */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-4">
          Membership Term Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "1 Month (Monthly)", count: durationCounts.monthly, filter: "1", color: "text-zinc-950 dark:text-zinc-200" },
            { label: "3 Months (Quarterly)", count: durationCounts.threeMonth, filter: "3", color: "text-amber-600 dark:text-amber-400" },
            { label: "6 Months (Semi-Annual)", count: durationCounts.sixMonth, filter: "6", color: "text-indigo-600 dark:text-indigo-400" },
            { label: "12 Months (Annual Elite)", count: durationCounts.annual, filter: "12", color: "text-gold-600 dark:text-gold-400" },
          ].map((d, i) => (
            <Link
              key={i}
              href={`/admin/members?duration=${d.filter}`}
              className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-gold-500/40 transition-colors group"
            >
              <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>{d.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-gold-500" />
              </div>
              <p className={`mt-2 font-display text-2xl font-black ${d.color}`}>
                {d.count} <span className="text-xs font-mono font-normal text-zinc-500">members</span>
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-Column Feeds: Urgent Expiries vs Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Urgent Expiry Queue */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Expiry Attention Queue
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
                Members expiring in the next 30 days.
              </p>
            </div>
            <Link
              href="/admin/renewals"
              className="text-xs font-mono text-gold-600 dark:text-gold-500 hover:underline uppercase tracking-wider font-semibold"
            >
              View All ({expiringIn30Days.length})
            </Link>
          </div>

          <div className="space-y-3">
            {expiringIn30Days.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">No upcoming expiries in the 30-day window.</p>
            ) : (
              expiringIn30Days.slice(0, 5).map((item) => {
                const daysLeft = Math.ceil(
                  (new Date(item.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-xs text-zinc-950 dark:text-white">
                        {item.member.firstName} {item.member.lastName}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                        {item.plan.name} • {item.member.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          daysLeft <= 7
                            ? "bg-crimson-500/10 text-crimson-600 dark:text-crimson-400 border border-crimson-500/40"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                        }`}
                      >
                        {daysLeft} days left
                      </span>
                      <Link
                        href={`/admin/members/${item.member.id}`}
                        className="block text-[11px] text-gold-600 dark:text-gold-500 hover:underline mt-1 font-semibold"
                      >
                        Renew Plan →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions & Payments */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Recent Collections
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
                Real-time verified payments and generated receipts.
              </p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-mono text-gold-600 dark:text-gold-500 hover:underline uppercase tracking-wider font-semibold"
            >
              Full Ledger →
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800"
              >
                <div>
                  <p className="font-bold text-xs text-zinc-950 dark:text-white">
                    {pay.member.firstName} {pay.member.lastName}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {pay.receiptNo} • {pay.paymentMethod}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{pay.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-zinc-500">
                    {new Date(pay.paidAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
