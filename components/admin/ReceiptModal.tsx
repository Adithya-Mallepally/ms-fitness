"use client";

import { Printer, X, Download, ShieldCheck } from "lucide-react";

interface ReceiptData {
  receiptNo: string;
  memberName: string;
  memberCode: string;
  phone: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string | null;
  startDate: string;
  endDate: string;
  paidAt: string;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-8 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
              Official Gym Tax Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-black text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Box */}
        <div id="printable-receipt" className="mt-4 sm:mt-6 bg-white text-zinc-900 p-4 sm:p-8 rounded-2xl shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-200 pb-5 sm:pb-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
                M S FITNESS
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Boutique Gym &amp; Wellness Club</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Plot 42, Apex Boulevard, Cyber City<br />
                Phone: +91 98765 43210 | GSTIN: 36AAACM1234F1Z5
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-mono font-bold">
                PAYMENT RECEIPT
              </span>
              <p className="text-xs font-mono font-bold text-black mt-1.5">{data.receiptNo}</p>
              <p className="text-[11px] text-zinc-500">
                Date: {new Date(data.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Member & Plan Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 sm:py-6 border-b border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Billed To</span>
              <p className="font-bold text-sm text-black">{data.memberName}</p>
              <p className="text-zinc-600 font-mono">Member ID: {data.memberCode}</p>
              <p className="text-zinc-600">Phone: {data.phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Membership Period</span>
              <p className="font-bold text-black">{data.planName}</p>
              <p className="text-zinc-600 font-mono">
                {new Date(data.startDate).toLocaleDateString("en-IN")} to{" "}
                {new Date(data.endDate).toLocaleDateString("en-IN")}
              </p>
              <p className="text-zinc-600 uppercase">
                Payment: {data.paymentMethod} {data.transactionRef ? `(${data.transactionRef})` : ""}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-5 sm:py-6 border-b border-zinc-200">
            <div className="flex justify-between text-xs font-mono uppercase text-zinc-400 pb-2 border-b border-zinc-100">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between py-3 text-xs">
              <div>
                <p className="font-semibold text-black">{data.planName}</p>
                <p className="text-[11px] text-zinc-500">Full facility access, dedicated shifts &amp; recovery</p>
              </div>
              <span className="font-mono font-bold text-black">
                ₹{data.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 flex justify-between items-center text-sm">
            <div className="text-[11px] text-zinc-500">
              Status: <span className="text-emerald-600 font-bold uppercase">Paid in Full</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 mr-2 sm:mr-3">Total Paid:</span>
              <span className="font-display font-black text-lg sm:text-xl text-black">
                ₹{data.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-dashed border-zinc-200 text-center text-[10px] text-zinc-400">
            Thank you for choosing M S Fitness. This is a computer-generated receipt and requires no physical signature.
          </div>
        </div>
      </div>
    </div>
  );
}
