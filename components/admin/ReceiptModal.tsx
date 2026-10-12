"use client";

import { Printer, X, CheckCircle2 } from "lucide-react";

export interface ReceiptData {
  receiptNo: string;
  memberName: string;
  memberCode: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  planName: string;
  durationMonths?: number | null;
  amount: number;
  originalAmount?: number | null;
  discountAmount?: number | null;
  couponCode?: string | null;
  paymentMethod: string;
  transactionRef?: string | null;
  startDate: string;
  endDate: string;
  paidAt: string;
  notes?: string | null;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  function handlePrint() {
    window.print();
  }

  const basePrice =
    data.originalAmount ||
    (data.discountAmount ? data.amount + data.discountAmount : data.amount);
  const discount = data.discountAmount || 0;

  return (
    <div
      id="receipt-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none"
    >
      <div
        id="receipt-modal-card"
        className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-7 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto print:static print:max-h-none print:w-full print:max-w-none print:p-0 print:m-0 print:border-none print:shadow-none print:bg-transparent print:overflow-visible"
      >
        {/* Screen-Only Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Official Gym Tax Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Box */}
        <div
          id="printable-receipt"
          className="mt-4 bg-white text-zinc-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-200 print:m-0 print:p-6 print:border print:border-zinc-900 print:rounded-none print:shadow-none print:w-full print:block"
        >
          {/* Header Branding */}
          <div className="flex flex-row justify-between items-start gap-4 border-b-2 border-zinc-950 pb-4">
            <div>
              <h2 className="font-display text-2xl font-black uppercase tracking-wider text-black leading-tight">
                M S FITNESS
              </h2>
              <p className="text-xs text-zinc-700 font-bold tracking-wide uppercase">
                Boutique Gym &amp; Wellness Club
              </p>
              <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                Thukkuguda, Hyderabad &bull; Contact: +91 98100 12345<br />
                GSTIN: 36AAACM1234F1Z5 &bull; Reg: MSF-HYD-2026
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-block bg-black text-white px-3 py-1 rounded text-[11px] font-mono font-bold tracking-wider">
                OFFICIAL JOINING RECEIPT
              </span>
              <p className="text-sm font-mono font-extrabold text-black mt-1.5">
                {data.receiptNo}
              </p>
              <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
                Date: {new Date(data.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Member Details & Membership Period */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 py-4 border-b border-zinc-200 text-xs">
            {/* Member Details */}
            <div className="space-y-1.5 pr-2 border-r border-zinc-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block pb-1 border-b border-zinc-100">
                Member Information
              </span>
              <div className="pt-0.5">
                <span className="text-zinc-500 text-[11px] block">Full Name:</span>
                <span className="font-bold text-sm text-black">{data.memberName}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Member Code:</span>
                <span className="font-mono font-bold text-black text-xs">{data.memberCode}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Phone:</span>
                <span className="font-mono text-zinc-900 font-semibold">{data.phone}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Email:</span>
                <span className="text-zinc-800 break-all">{data.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Category:</span>
                <span className="font-bold uppercase text-zinc-900">{data.gender || "MEN"}</span>
              </div>
            </div>

            {/* Membership Details */}
            <div className="space-y-1.5 pl-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block pb-1 border-b border-zinc-100">
                Enrollment &amp; Validity
              </span>
              <div className="pt-0.5">
                <span className="text-zinc-500 text-[11px] block">Plan:</span>
                <span className="font-bold text-sm text-black">{data.planName}</span>
              </div>
              {data.durationMonths && (
                <div>
                  <span className="text-zinc-500 text-[11px] block">Duration:</span>
                  <span className="font-semibold text-zinc-900">{data.durationMonths} Calendar Month(s)</span>
                </div>
              )}
              <div>
                <span className="text-zinc-500 text-[11px] block">Validity Period:</span>
                <span className="font-mono font-bold text-zinc-950 text-[11px]">
                  {new Date(data.startDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  to{" "}
                  {new Date(data.endDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Payment Method:</span>
                <span className="font-semibold uppercase text-zinc-900">{data.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Transaction Reference:</span>
                <span className="font-mono text-zinc-900">{data.transactionRef || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div className="py-4 border-b border-zinc-200">
            <div className="flex justify-between text-xs font-mono uppercase text-zinc-500 font-bold pb-1.5 border-b border-zinc-200">
              <span>Item / Description</span>
              <span className="text-right">Amount (₹)</span>
            </div>

            {/* Base Plan */}
            <div className="flex justify-between items-start py-2.5 text-xs border-b border-dashed border-zinc-100">
              <div>
                <p className="font-bold text-black">{data.planName}</p>
                <p className="text-[10px] text-zinc-500">
                  Full facility gym access, workout floors, dedicated locker &amp; shower amenities
                </p>
              </div>
              <span className="font-mono font-bold text-black text-right whitespace-nowrap pl-4">
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Discount if applicable */}
            {discount > 0 && (
              <div className="flex justify-between items-center py-2 text-xs text-emerald-700 bg-emerald-50/60 px-2 rounded mt-1.5">
                <div>
                  <span className="font-bold">Discount Applied</span>
                  {data.couponCode && (
                    <span className="font-mono text-[10px] ml-1.5 bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                      Code: {data.couponCode}
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold whitespace-nowrap">
                  -₹{discount.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Total Summary */}
          <div className="pt-3.5 flex justify-between items-center text-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Payment Status:</span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" /> Paid in Full
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-600 mr-2 font-medium">Net Amount Paid:</span>
              <span className="font-display font-black text-2xl text-black">
                ₹{data.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Notes if available */}
          {data.notes && (
            <div className="mt-3 p-2 bg-zinc-50 rounded border border-zinc-200 text-[11px] text-zinc-700">
              <span className="font-bold text-zinc-900">Notes: </span>
              {data.notes}
            </div>
          )}

          {/* Footer Notes */}
          <div className="mt-6 pt-3 border-t border-dashed border-zinc-300 text-center text-[10px] text-zinc-500 space-y-0.5">
            <p className="font-semibold text-zinc-700">
              Thank you for choosing M S Fitness. Welcome to the elite wellness community!
            </p>
            <p className="text-[9px] text-zinc-400">
              This is a verified computer-generated joining receipt. No physical signature required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
