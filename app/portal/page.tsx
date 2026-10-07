"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  Phone,
  Search,
  Sparkles,
  Printer
} from "lucide-react";
import ReceiptModal from "@/components/admin/ReceiptModal";
import DynamicQrPassModal from "@/components/portal/DynamicQrPassModal";
import MemberAttendanceCalendar, { AttendanceItem } from "@/components/portal/MemberAttendanceCalendar";
import ThemeToggle from "@/components/ThemeToggle";

interface MemberData {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: string;
  status: string;
  memberships: {
    id: string;
    startDate: string;
    endDate: string;
    amountPaid: number;
    status: string;
    plan: {
      name: string;
      category: string;
      durationMonths: number;
    };
    payments: {
      id: string;
      receiptNo: string;
      amount: number;
      paymentMethod: string;
      transactionRef: string | null;
      paidAt: string;
    }[];
  }[];
  attendances?: AttendanceItem[];
}

export default function MemberPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Quick lookup function
  async function handleLookup(queryToSearch?: string) {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Member not found");
      }
      setMember(data);
    } catch (err: any) {
      setError(err.message || "Failed to load member records.");
      setMember(null);
    } finally {
      setLoading(false);
    }
  }

  // Optional auto-lookup from URL query parameter (e.g. ?q=9810012345 or ?q=MSF-1001)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setSearchQuery(q);
        handleLookup(q);
      }
    }
  }, []);

  const activeMembership = member?.memberships?.[0];
  const daysRemaining = activeMembership
    ? Math.ceil(
        (new Date(activeMembership.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="min-h-screen bg-void text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-zinc-200 dark:border-zinc-900">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <ThemeToggle />
            <div className="font-display text-base sm:text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              M S FITNESS <span className="text-gold-500 text-xs font-mono">MEMBER PORTAL</span>
            </div>
          </div>
        </div>

        {/* Member Lookup Bar */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Enter registered phone number or Member Code (e.g. 9810012345 or MSF-1001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="w-full rounded-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 pl-11 pr-4 py-3 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500"
              />
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black dark:hover:bg-gold-500 dark:hover:text-black transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? "Searching..." : "Access Pass"}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Official Digital Member Pass Verification</span>
            <span className="hidden sm:inline">Encrypted Real-Time Access</span>
          </div>

          {error && <p className="mt-4 text-xs text-crimson-500 font-medium">{error}</p>}
        </div>

        {/* Initial Verification State */}
        {!member && !loading && !error && (
          <div className="mt-10 p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-center max-w-xl mx-auto shadow-sm animate-fadeIn">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mx-auto flex items-center justify-center text-gold-500 mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Member Pass Verification
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
              Enter your registered mobile number or unique Member ID above to access your digital facility pass, live validity dates, and official payment receipts.
            </p>
          </div>
        )}

        {/* Member Profile & Digital Pass */}
        {member && (
          <div className="mt-10 space-y-8 animate-fadeIn">
            {/* Top Pass Card (Saints & Stars VIP Aesthetic) */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-950 dark:to-black border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 md:p-10 shadow-xl dark:shadow-2xl">
              <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-gold-500/10 blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
                    Official Member Credentials
                  </span>
                  <h2 className="mt-1 font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-zinc-950 dark:text-white">
                    {member.firstName} {member.lastName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono text-zinc-900 dark:text-zinc-300 font-bold">ID: {member.memberCode}</span>
                    <span>•</span>
                    <span>{member.phone}</span>
                    <span>•</span>
                    <span className="uppercase">{member.gender}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {daysRemaining > 30 ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Active Membership
                    </div>
                  ) : daysRemaining >= 0 ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" /> Expiring Soon ({daysRemaining}d left)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-crimson-500/10 border border-crimson-500/30 px-5 py-2 text-xs font-bold uppercase tracking-widest text-crimson-600 dark:text-crimson-500">
                      <XCircle className="h-4 w-4" /> Membership Expired
                    </div>
                  )}
                </div>
              </div>

              {/* Active Plan Metrics */}
              {activeMembership ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                      Enrolled Plan
                    </span>
                    <h4 className="mt-1 font-display text-lg font-bold text-zinc-950 dark:text-white uppercase">
                      {activeMembership.plan.name}
                    </h4>
                    <span className="text-xs text-gold-600 dark:text-gold-500 font-mono mt-1 block font-semibold">
                      {activeMembership.plan.durationMonths} Month Duration
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                      Validity Period
                    </span>
                    <h4 className="mt-1 font-mono text-sm font-semibold text-zinc-950 dark:text-white">
                      {new Date(activeMembership.startDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(activeMembership.endDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {daysRemaining >= 0
                        ? `${daysRemaining} days remaining`
                        : `Expired ${Math.abs(daysRemaining)} days ago`}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPassModalOpen(true)}
                    type="button"
                    className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/60 dark:hover:border-gold-500/60 flex items-center justify-between text-left group transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-gold-500 font-semibold transition-colors">
                          Front Desk Pass
                        </span>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200 font-medium">
                        Scan at entrance scanner
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] font-mono text-gold-600 dark:text-gold-400 font-semibold">
                        Tap to generate dynamic QR →
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black group-hover:bg-gold-500 group-hover:text-black dark:group-hover:bg-gold-500 dark:group-hover:text-black flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                      <QrCode className="h-7 w-7" />
                    </div>
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-sm text-zinc-500">No active membership found.</p>
              )}
            </div>

            {/* Attendance & Workout Consistency Calendar */}
            <MemberAttendanceCalendar
              attendances={member.attendances || []}
              memberName={`${member.firstName} ${member.lastName}`}
              membershipStartDate={activeMembership?.startDate}
            />

            {/* Payment & Receipts Ledger */}
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                    Payment &amp; Receipt History
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
                    Download or print verifiable tax receipts for your membership payments.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                    {member.memberships.flatMap((ms) =>
                      ms.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-950 dark:text-white">
                            {p.receiptNo}
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            {new Date(p.paidAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gold-600 dark:text-gold-400">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 uppercase font-medium">{p.paymentMethod}</td>
                          <td className="py-3.5 px-4 font-mono text-zinc-500">
                            {p.transactionRef || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() =>
                                setSelectedReceipt({
                                  receiptNo: p.receiptNo,
                                  memberName: `${member.firstName} ${member.lastName}`,
                                  memberCode: member.memberCode,
                                  phone: member.phone,
                                  planName: ms.plan.name,
                                  amount: p.amount,
                                  paymentMethod: p.paymentMethod,
                                  transactionRef: p.transactionRef,
                                  startDate: ms.startDate,
                                  endDate: ms.endDate,
                                  paidAt: p.paidAt,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-gold-500 hover:text-black dark:hover:bg-gold-500 dark:hover:text-black transition-colors font-medium shadow-sm"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Dynamic Entrance QR Pass Modal */}
      {member && (
        <DynamicQrPassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          member={member}
          membership={activeMembership || null}
          daysRemaining={daysRemaining}
        />
      )}
    </div>
  );
}
