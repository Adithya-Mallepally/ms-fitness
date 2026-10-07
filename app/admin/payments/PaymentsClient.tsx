"use client";

import { useState } from "react";
import { Search, CreditCard, Printer, Filter, CheckCircle2, FileSpreadsheet } from "lucide-react";
import ReceiptModal from "@/components/admin/ReceiptModal";

export default function PaymentsClient({
  initialPayments,
  totalCollected,
}: {
  initialPayments: any[];
  totalCollected: number;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Financial Collections &amp; Verified Invoices
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            PAYMENT TRANSACTIONS
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Complete immutable ledger of membership collections, digital receipts, and bank references.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left sm:text-right w-fit">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
            Total Collections Filtered
          </span>
          <span className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              name="q"
              placeholder="Search Receipt No, Member, Txn Ref..."
              className="w-full rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <select
            name="method"
            className="rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-gold-500 uppercase font-mono"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>

          <button
            type="submit"
            className="rounded-full bg-zinc-950 dark:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-colors py-2.5 shadow-sm cursor-pointer"
          >
            Filter Ledger
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-4 px-6">Receipt No</th>
                <th className="py-4 px-6">Date &amp; Time</th>
                <th className="py-4 px-6">Member Name</th>
                <th className="py-4 px-6">Enrolled Plan</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
              {initialPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                initialPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-950 dark:text-white">{p.receiptNo}</td>
                    <td className="py-4 px-6 font-mono text-zinc-600 dark:text-zinc-400">
                      {new Date(p.paidAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-950 dark:text-white">
                      {p.member.firstName} {p.member.lastName}
                      <span className="block text-[10px] text-zinc-500 font-mono">
                        {p.member.memberCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-900 dark:text-white">{p.membership.plan.name}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-700 dark:text-zinc-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-600 dark:text-zinc-500">
                      {p.transactionRef || "—"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setSelectedReceipt({
                            receiptNo: p.receiptNo,
                            memberName: `${p.member.firstName} ${p.member.lastName}`,
                            memberCode: p.member.memberCode,
                            phone: p.member.phone,
                            planName: p.membership.plan.name,
                            amount: p.amount,
                            paymentMethod: p.paymentMethod,
                            transactionRef: p.transactionRef,
                            startDate: p.membership.startDate,
                            endDate: p.membership.endDate,
                            paidAt: p.paidAt,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 hover:bg-gold-500 hover:text-black font-semibold transition-colors shadow-sm"
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
