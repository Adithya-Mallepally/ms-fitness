import Link from "next/link";
import prisma from "@/lib/prisma";
import { Search, UserPlus, Filter, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

interface MemberListPageProps {
  searchParams: {
    q?: string;
    status?: string;
    duration?: string;
    gender?: string;
  };
}

export default async function MemberListPage({ searchParams }: MemberListPageProps) {
  const query = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status || "ALL";
  const durationFilter = searchParams.duration ? parseInt(searchParams.duration) : undefined;
  const genderFilter = searchParams.gender || "ALL";

  const members = await prisma.member.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { memberCode: { contains: query } },
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { phone: { contains: query } },
              ],
            }
          : {},
        statusFilter !== "ALL" ? { status: statusFilter } : {},
        genderFilter !== "ALL" ? { gender: genderFilter } : {},
        durationFilter
          ? {
              memberships: {
                some: {
                  plan: { durationMonths: durationFilter },
                },
              },
            }
          : {},
      ],
    },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Records &amp; Profiles
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            MEMBER DIRECTORY
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Search, filter by duration, view historical memberships, and issue renewals.
          </p>
        </div>

        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-transform active:scale-95 shadow-md w-full sm:w-auto justify-center"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Joining</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search Name, Phone, ID..."
              className="w-full rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Status Filter */}
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-gold-500 uppercase font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING">Expiring Soon (&lt;30d)</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Membership Term Filter */}
          <select
            name="duration"
            defaultValue={searchParams.duration || ""}
            className="rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-gold-500 uppercase font-mono"
          >
            <option value="">All Durations</option>
            <option value="1">1 Month (Monthly)</option>
            <option value="3">3 Months (Quarterly)</option>
            <option value="6">6 Months (Semi-Annual)</option>
            <option value="12">12 Months (Annual Elite)</option>
          </select>

          {/* Apply Filter Button */}
          <button
            type="submit"
            className="rounded-full bg-zinc-950 dark:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-colors py-2.5 shadow-sm cursor-pointer"
          >
            Filter Records
          </button>
        </form>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-4 px-6">Member Code</th>
                <th className="py-4 px-6">Member Name</th>
                <th className="py-4 px-6">Phone / Contact</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Current Plan</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No members match the selected criteria.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const latestMembership = m.memberships[0];
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-zinc-950 dark:text-white">
                        {m.memberCode}
                      </td>
                      <td className="py-4 px-6 font-semibold text-zinc-950 dark:text-white">
                        {m.firstName} {m.lastName}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-600 dark:text-zinc-400">
                        {m.phone}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-700 dark:text-zinc-300">
                          {m.gender}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {latestMembership ? (
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {latestMembership.plan.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">No plan</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-700 dark:text-zinc-300">
                        {latestMembership ? (
                          new Date(latestMembership.endDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {m.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : m.status === "EXPIRING" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                            <AlertTriangle className="h-3 w-3" /> Expiring
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-500/10 border border-crimson-500/30 text-[10px] font-mono font-bold text-crimson-600 dark:text-crimson-400 uppercase">
                            <XCircle className="h-3 w-3" /> Expired
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 hover:bg-gold-500 hover:text-black font-semibold transition-colors shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 text-white dark:text-zinc-400 group-hover:text-black" />
                          <span className="text-white dark:text-zinc-200">View / Renew</span>
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
