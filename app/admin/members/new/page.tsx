"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  UserPlus, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from "lucide-react";
import { calculateExpiryDate } from "@/lib/expiry";
import ReceiptModal from "@/components/admin/ReceiptModal";

interface PlanOption {
  id: string;
  code: string;
  name: string;
  category: string;
  durationMonths: number;
  price: number;
  priceId: string;
}

function NewJoiningForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlanCode = searchParams.get("plan");

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("MEN");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdReceipt, setCreatedReceipt] = useState<any>(null);

  // Fetch plans
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/admin/plans");
        const data = await res.json();
        setPlans(data);
        if (data.length > 0) {
          if (preselectedPlanCode) {
            const matched = data.find((p: PlanOption) => p.code === preselectedPlanCode);
            setSelectedPlanId(matched ? matched.id : data[0].id);
          } else {
            setSelectedPlanId(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, [preselectedPlanCode]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Live Expiry Date Calculation
  const calculatedExpiry = selectedPlan && startDate
    ? calculateExpiryDate(startDate, selectedPlan.durationMonths)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/members/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          gender,
          planId: selectedPlanId,
          startDate,
          paymentMethod,
          transactionRef,
          notes,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to register member.");
      }

      // Show receipt modal
      setCreatedReceipt(result.data.receipt);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            NEW MEMBER JOINING
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
            Register member profile, enroll membership plan, record payment, and generate receipt.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-crimson-500/10 border border-crimson-500/30 text-xs text-crimson-400 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Member Personal Details */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-6">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-black text-xs font-mono font-bold">1</span>
            Member Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Kumar"
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Phone Number * (Duplicate Checked)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@gmail.com"
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Gender / Category *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500 uppercase font-mono"
              >
                <option value="MEN">Men (Men&apos;s Studio)</option>
                <option value="WOMEN">Women (Women&apos;s Studio)</option>
                <option value="COUPLE">Couple Pass</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Plan Selection & Auto Expiry Calculation */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-6">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-black text-xs font-mono font-bold">2</span>
            Membership Plan &amp; Calculated Expiry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Select Active Membership Plan *
              </label>
              {loadingPlans ? (
                <p className="text-xs text-zinc-500">Loading plans...</p>
              ) : (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toLocaleString("en-IN")} ({p.durationMonths} Mo)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Membership Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Dynamic Live Expiry & Fee Calculation Card */}
          {selectedPlan && calculatedExpiry && (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
                  Calculated Membership Validity Period
                </span>
                <p className="mt-1 font-mono text-sm font-semibold text-zinc-950 dark:text-white">
                  {new Date(startDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  –{" "}
                  {calculatedExpiry.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5 block">
                  Duration: {selectedPlan.durationMonths} calendar month(s) inclusive
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Fee Amount Due
                </span>
                <p className="font-display text-2xl sm:text-3xl font-black text-gold-600 dark:text-gold-400">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment Recording */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-6">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-black text-xs font-mono font-bold">3</span>
            Payment Collection &amp; Receipting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500 uppercase font-mono"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash Payment</option>
                <option value="CARD">Debit / Credit Card (POS)</option>
                <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Transaction / Reference ID (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI-TXN-98212 or Receipt Ref"
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Staff Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Registered with introductory guided tour"
              className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <Link
            href="/admin/members"
            className="px-8 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-8 sm:px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg text-center"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{submitting ? "Processing..." : "Complete & Print Receipt"}</span>
          </button>
        </div>
      </form>

      {/* Generated Receipt Modal */}
      {createdReceipt && (
        <ReceiptModal
          data={createdReceipt}
          onClose={() => {
            setCreatedReceipt(null);
            router.push("/admin/members");
          }}
        />
      )}
    </div>
  );
}

export default function NewJoiningPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-zinc-500">Loading registration form...</div>}>
      <NewJoiningForm />
    </Suspense>
  );
}
