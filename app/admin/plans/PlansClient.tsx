"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, ShieldCheck, History, ArrowUpRight, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanForUpdate, setSelectedPlanForUpdate] = useState<any | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleFeeUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanForUpdate) return;
    setSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/admin/plans/update-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanForUpdate.id,
          newPrice: parseFloat(newPrice),
          effectiveFrom,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update fee version.");
      }

      setSuccessMessage(
        `Successfully updated ${selectedPlanForUpdate.name} to Version ${data.newPrice.version} (₹${data.newPrice.price}). Historical records remain protected.`
      );
      setSelectedPlanForUpdate(null);
      setNewPrice("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update fee.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Membership Pricing &amp; Fee Architecture
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            MEMBERSHIP PLANS &amp; FEES
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Manage published gym pricing. Updates create immutable price versions without altering historical payments.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs w-fit">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-zinc-700 dark:text-zinc-300 font-mono">Version-Controlled Pricing</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => {
          const currentPrice = p.prices[0];
          return (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
                    {p.category} STUDIO
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 font-medium">
                    {p.code}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-lg font-bold uppercase text-zinc-950 dark:text-white">
                  {p.name}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
                  {p.description || "Full studio and facility access."}
                </p>

                {/* Price Display */}
                <div className="mt-5 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-600 dark:text-zinc-400 font-semibold block">
                      Active Price
                    </span>
                    <span className="font-display text-2xl font-black text-zinc-950 dark:text-white">
                      ₹{currentPrice?.price.toLocaleString("en-IN") || "N/A"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-800 dark:text-gold-400 font-bold bg-amber-500/15 dark:bg-gold-500/10 border border-amber-500/30 dark:border-gold-500/30 px-2.5 py-1 rounded-full">
                    Ver. {currentPrice?.version || 1}
                  </span>
                </div>

                {/* Version History Breakdown */}
                {p.prices.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-900 text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold block mb-1">
                      Historical Price Versions:
                    </span>
                    <div className="space-y-1">
                      {p.prices.slice(1).map((hist: any) => (
                        <div key={hist.id} className="flex justify-between text-zinc-600 dark:text-zinc-400 font-mono">
                          <span>Ver. {hist.version} (Archived)</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-200">₹{hist.price.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                  {p.memberships.length} Active Enrollment(s)
                </span>
                <button
                  onClick={() => {
                    setSelectedPlanForUpdate(p);
                    setNewPrice(currentPrice ? currentPrice.price.toString() : "");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-xs font-bold uppercase tracking-wider hover:bg-gold-500 hover:text-black transition-colors shadow-sm"
                >
                  <span className="text-white dark:text-zinc-200">Update Fee</span>
                  <ArrowUpRight className="h-3 w-3 text-white dark:text-zinc-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fee Versioning Modal */}
      {selectedPlanForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPlanForUpdate(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 sm:top-6 sm:right-6 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
              Price Revision &amp; Effective Dates
            </span>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Update {selectedPlanForUpdate.name}
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              This will create an active price version effective from the specified date. All existing member records and historical receipts will permanently retain their original charged fee.
            </p>

            <form onSubmit={handleFeeUpdate} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-2">
                  New Price in INR (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 16999"
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-sm text-zinc-950 dark:text-white font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-2">
                  Effective From Date *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-950 dark:text-white font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  New memberships and renewals processed on or after this date will automatically adopt the updated pricing. Historical payments and existing member contracts will remain unaffected.
                </span>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpdate(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gold-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-50 text-center shadow-md"
                >
                  {submitting ? "Publishing Version..." : "Confirm & Save Version"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
