"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Printer,
  X,
  History
} from "lucide-react";
import { calculateExpiryDate } from "@/lib/expiry";
import ReceiptModal from "@/components/admin/ReceiptModal";

export default function MemberProfileClient({
  member,
  plans,
}: {
  member: any;
  plans: any[];
}) {
  const router = useRouter();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(
    plans.length > 0 ? plans[0].id : ""
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const activeMembership = member.memberships[0];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const calculatedRenewalExpiry = selectedPlan && startDate
    ? calculateExpiryDate(startDate, selectedPlan.durationMonths)
    : null;

  async function handleRenewal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/members/${member.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          startDate,
          paymentMethod,
          transactionRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to renew membership");
      }

      setShowRenewModal(false);
      setSelectedReceipt(data.receipt);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to process renewal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
              {member.firstName} {member.lastName}
            </h1>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-gold-600 dark:text-gold-400 font-bold">
              {member.memberCode}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowRenewModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-all hover:scale-105 active:scale-95 shadow-md w-full sm:w-auto text-center"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Renew Membership</span>
        </button>
      </div>

      {/* Member Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Contact Details
          </span>
          <div className="mt-4 space-y-2.5 text-xs">
            <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Phone className="h-4 w-4 text-gold-600 dark:text-gold-500" />
              <span className="font-mono font-medium">{member.phone}</span>
            </p>
            {member.email && (
              <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <span>{member.email}</span>
              </p>
            )}
            <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <span className="uppercase">Category: {member.gender}</span>
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Current Membership Status
          </span>
          <div className="mt-4">
            {activeMembership ? (
              <>
                <p className="font-display text-base font-bold text-zinc-950 dark:text-white">
                  {activeMembership.plan.name}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  Valid: {new Date(activeMembership.startDate).toLocaleDateString("en-IN")} –{" "}
                  {new Date(activeMembership.endDate).toLocaleDateString("en-IN")}
                </p>
                <div className="mt-3">
                  {member.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Active Pass
                    </span>
                  ) : member.status === "EXPIRING" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                      <AlertTriangle className="h-3 w-3" /> Expiring Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-500/10 border border-crimson-500/30 text-[10px] font-mono font-bold text-crimson-600 dark:text-crimson-400 uppercase">
                      <XCircle className="h-3 w-3" /> Expired
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-zinc-500">No active plan.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Registration Details
          </span>
          <div className="mt-4 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
            <p>
              Joined:{" "}
              <span className="font-mono text-zinc-950 dark:text-white font-medium">
                {new Date(member.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            <p>
              Total Memberships Enrolled:{" "}
              <span className="font-mono text-zinc-950 dark:text-white font-bold">{member.memberships.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Historical Membership Periods */}
      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-6 flex items-center gap-2">
          <History className="h-4 w-4 text-gold-600 dark:text-gold-500" /> Membership History &amp; Renewal Periods
        </h3>

        <div className="space-y-4">
          {member.memberships.map((ms: any, index: number) => (
            <div
              key={ms.id}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-zinc-950 dark:text-white">{ms.plan.name}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 uppercase font-medium">
                    {ms.source}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  Validity: {new Date(ms.startDate).toLocaleDateString("en-IN")} –{" "}
                  {new Date(ms.endDate).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono text-sm font-bold text-gold-600 dark:text-gold-400">
                  ₹{ms.amountPaid.toLocaleString("en-IN")}
                </span>
                <span className="block text-[11px] text-zinc-500 font-mono">
                  Price Ver. {ms.price?.version || 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Receipt Ledger for this Member */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-6 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Payments &amp; Receipts
        </h3>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
              {member.memberships.flatMap((ms: any) =>
                ms.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-950 dark:text-white">{p.receiptNo}</td>
                    <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">{new Date(p.paidAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-4 font-bold text-gold-600 dark:text-gold-400 font-mono">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-zinc-700 dark:text-zinc-300">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {p.transactionRef || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 hover:bg-gold-500 hover:text-black font-semibold transition-colors shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5 text-white dark:text-zinc-400" />
                        <span className="text-white dark:text-zinc-200">Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRenewModal(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="text-xs font-mono uppercase tracking-widest text-gold-500 font-bold">
              Instant Pass Renewal
            </span>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              Renew Membership Pass
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Extending membership for {member.firstName} {member.lastName} ({member.memberCode}).
            </p>

            <form onSubmit={handleRenewal} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                  Select Plan *
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-white focus:outline-none focus:border-gold-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toLocaleString("en-IN")} ({p.durationMonths} Mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                  Renewal Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              {selectedPlan && calculatedRenewalExpiry && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">New Expiry Date:</span>
                    <span className="font-mono font-bold text-white">
                      {calculatedRenewalExpiry.toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400">Renewal Fee:</span>
                    <span className="font-mono font-bold text-gold-400 text-sm">
                      ₹{selectedPlan.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-white focus:outline-none focus:border-gold-500 uppercase font-mono"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                    Txn Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Ref ID"
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono text-zinc-400 hover:text-white text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-gold-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-50 text-center"
                >
                  {submitting ? "Processing..." : "Confirm & Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
