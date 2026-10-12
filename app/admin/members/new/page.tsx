"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  Tag,
  Copy,
  Check,
  Percent,
  X
} from "lucide-react";
import { calculateExpiryDate } from "@/lib/expiry";
import { STATIC_COUPONS, findCoupon, type DiscountCoupon } from "@/lib/coupons";
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

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  // Pricing & Discount Calculations
  const basePrice = selectedPlan ? selectedPlan.price : 0;
  const discountAmount = appliedCoupon
    ? Math.round((basePrice * appliedCoupon.discountPercent) / 100)
    : 0;
  const finalPayable = Math.max(0, basePrice - discountAmount);

  function handleApplyCoupon(code: string) {
    setCouponError("");
    const coupon = findCoupon(code);
    if (!coupon) {
      setCouponError(`"${code}" is not a valid coupon code. Please choose from available codes below.`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  function handleCopy(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  }

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
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: discountAmount,
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
            Register member profile, enroll membership plan, apply promo coupons, and generate receipt.
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

              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                  Plan Base Fee
                </span>
                <p className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                  ₹{basePrice.toLocaleString("en-IN")}
                </p>
                {appliedCoupon && (
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    -₹{discountAmount.toLocaleString("en-IN")} ({appliedCoupon.discountPercent}% OFF)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Discount Coupon Section */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-black text-xs font-mono font-bold">3</span>
                Discount Coupons
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
                Apply a static promotional discount code to reduce the membership fee.
              </p>
            </div>
            {appliedCoupon && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                <Check className="h-3.5 w-3.5" /> Coupon {appliedCoupon.code} Active
              </span>
            )}
          </div>

          {/* Coupon Input & Manual Apply */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Enter or Select Coupon Code
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="e.g. MSF20"
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white font-mono uppercase focus:outline-none focus:border-gold-500"
                />
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"
                    title="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleApplyCoupon(couponInput)}
                disabled={!couponInput.trim()}
                className="px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-colors flex-shrink-0"
              >
                Apply Coupon
              </button>
            </div>

            {couponError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-mono">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          {/* Static Available Coupons Grid */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
              Available Static Coupon Codes (Click to Copy or Apply):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {STATIC_COUPONS.map((coupon) => {
                const isSelected = appliedCoupon?.code === coupon.code;
                const isCopied = copiedCode === coupon.code;

                return (
                  <div
                    key={coupon.code}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50"
                    }`}
                    onClick={() => handleApplyCoupon(coupon.code)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-600 dark:text-gold-400">
                        {coupon.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(coupon.code);
                        }}
                        title="Copy coupon code"
                        className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      <p className="font-mono font-bold text-xs tracking-wider text-zinc-950 dark:text-white">
                        {coupon.code}
                      </p>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">
                        {isCopied ? "Copied!" : isSelected ? "Applied" : "Tap to apply"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applied Coupon Savings Banner */}
          {appliedCoupon && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    Coupon {appliedCoupon.code} Applied Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    {appliedCoupon.discountPercent}% discount saving ₹{discountAmount.toLocaleString("en-IN")} on this membership.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-emerald-900 dark:text-emerald-200 hover:underline font-mono"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Step 4: Payment Recording */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-black text-xs font-mono font-bold">4</span>
              Payment Collection &amp; Receipting
            </h3>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Final Amount Due:</span>
              <span className="font-display text-lg font-black text-gold-600 dark:text-gold-400">
                ₹{finalPayable.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

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
            <span>{submitting ? "Processing..." : `Complete & Print Receipt (₹${finalPayable.toLocaleString("en-IN")})`}</span>
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
