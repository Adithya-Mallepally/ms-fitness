import prisma from "@/lib/prisma";
import Link from "next/link";
import { BarChart3, Download, TrendingUp, CreditCard, PieChart, Users, DollarSign } from "lucide-react";
import { formatINR } from "@/lib/expiry";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [payments, members, memberships] = await Promise.all([
    prisma.payment.findMany({
      include: {
        membership: { include: { plan: true } },
      },
      orderBy: { paidAt: "desc" },
    }),
    prisma.member.findMany(),
    prisma.membership.findMany({
      include: { plan: true },
    }),
  ]);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  // Revenue by payment method
  const revenueByMethod = payments.reduce((acc: Record<string, number>, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {});

  // Revenue by plan
  const revenueByPlan = payments.reduce((acc: Record<string, { count: number; total: number }>, p) => {
    const planName = p.membership.plan.name;
    if (!acc[planName]) {
      acc[planName] = { count: 0, total: 0 };
    }
    acc[planName].count += 1;
    acc[planName].total += p.amount;
    return acc;
  }, {});

  // Member category breakdown
  const categoryCounts = {
    men: members.filter((m) => m.gender === "MEN").length,
    women: members.filter((m) => m.gender === "WOMEN").length,
    couple: members.filter((m) => m.gender === "COUPLE").length,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Financial Analytics &amp; Revenue Audit
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            OPERATIONAL &amp; FINANCIAL REPORTS
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Aggregate revenue performance, payment method breakdown, and enrollment distribution.
          </p>
        </div>

        <a
          href="/api/admin/reports/export"
          download
          className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-white dark:text-black hover:bg-gold-500 dark:hover:bg-gold-500 transition-all hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto text-center"
        >
          <Download className="h-4 w-4" />
          <span>Export All Data (CSV)</span>
        </a>
      </div>

      {/* Top Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Total Realized Revenue</span>
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-4 font-display text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <span className="text-xs text-zinc-500 font-mono mt-1 block">From {payments.length} verified transactions</span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Active Member Base</span>
            <Users className="h-5 w-5 text-gold-600 dark:text-gold-500" />
          </div>
          <p className="mt-4 font-display text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">
            {members.length}
          </p>
          <span className="text-xs text-zinc-500 font-mono mt-1 block">Across all studio tiers</span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Average Transaction Size</span>
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-4 font-display text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">
            ₹{payments.length ? Math.round(totalRevenue / payments.length).toLocaleString("en-IN") : 0}
          </p>
          <span className="text-xs text-zinc-500 font-mono mt-1 block">Average per membership billing</span>
        </div>
      </div>

      {/* Two Column Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Payment Methods Breakdown */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-6 shadow-sm">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Collections By Payment Method
          </h3>

          <div className="space-y-4">
            {Object.entries(revenueByMethod).map(([method, amount]) => {
              const percentage = totalRevenue ? Math.round((amount / totalRevenue) * 100) : 0;
              return (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono uppercase text-zinc-700 dark:text-zinc-300 font-bold">{method}</span>
                    <span className="font-mono text-zinc-950 dark:text-white font-semibold">
                      ₹{amount.toLocaleString("en-IN")} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Studio Category Distribution */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-6 shadow-sm">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
            <PieChart className="h-4 w-4 text-gold-600 dark:text-gold-500" /> Enrollment by Studio Category
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Men&apos;s Studio</span>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{categoryCounts.men}</p>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Members</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Women&apos;s Studio</span>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{categoryCounts.women}</p>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Members</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Couple Pass</span>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">{categoryCounts.couple}</p>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Performance Table */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-6">
          Membership Plan Financial Performance
        </h3>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Total Subscriptions</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
              {Object.entries(revenueByPlan).map(([name, data]) => (
                <tr key={name} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                  <td className="py-3.5 px-4 font-semibold text-zinc-950 dark:text-white">{name}</td>
                  <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">{data.count} enrollment(s)</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{data.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
