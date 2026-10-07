"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

type Category = "MEN" | "WOMEN" | "COUPLE";

interface PlanTier {
  id: string;
  name: string;
  duration: string;
  durationMonths: number;
  price: number;
  dailyRate: string;
  badge?: string;
  isPopular?: boolean;
  perks: string[];
}

const PRICING_DATA: Record<Category, PlanTier[]> = {
  MEN: [
    {
      id: "MEN-1M",
      name: "Men Monthly",
      duration: "1 Month",
      durationMonths: 1,
      price: 1700,
      dailyRate: "₹56 / day",
      perks: [
        "Unrestricted access to Men's Studio & Free Weights",
        "Morning & Evening session shifts",
        "Infrared sauna & recovery access",
        "Digital locker & shower facilities",
      ],
    },
    {
      id: "MEN-3M",
      name: "Men 3 Months",
      duration: "3 Months (Quarterly)",
      durationMonths: 3,
      price: 4499,
      dailyRate: "₹50 / day",
      badge: "SAVE 12%",
      perks: [
        "Everything in Monthly tier",
        "1x Complimentary Movement & Body Composition Scan",
        "Custom high-intensity strength starter program",
        "Sauna and contrast therapy access",
      ],
    },
    {
      id: "MEN-6M",
      name: "Men 6 Months",
      duration: "6 Months (Semi-Annual)",
      durationMonths: 6,
      price: 8499,
      dailyRate: "₹47 / day",
      badge: "POPULAR CHOICE",
      isPopular: true,
      perks: [
        "Everything in Quarterly tier",
        "Priority studio workout booking",
        "2x Guest Passes per quarter",
        "Dedicated trainer check-ins every 4 weeks",
      ],
    },
    {
      id: "MEN-12M",
      name: "Men Annual Elite",
      duration: "12 Months (Full Year)",
      durationMonths: 12,
      price: 14999,
      dailyRate: "₹41 / day",
      badge: "BEST VALUE",
      perks: [
        "All-inclusive 365-day VIP facility pass",
        "Unlimited Cryo & Sauna recovery sessions",
        "5x VIP Guest Day Passes",
        "Permanent locker reservation",
        "M S Fitness Elite Gym Pack & Shaker",
      ],
    },
  ],
  WOMEN: [
    {
      id: "WOM-1M",
      name: "Women Monthly",
      duration: "1 Month",
      durationMonths: 1,
      price: 999,
      dailyRate: "₹33 / day",
      perks: [
        "Dedicated Women's studio & functional turf",
        "Pilates & core conditioning zone",
        "Morning & Evening dedicated shifts",
        "Luxury powder room & private showers",
      ],
    },
    {
      id: "WOM-3M",
      name: "Women 3 Months",
      duration: "3 Months (Quarterly)",
      durationMonths: 3,
      price: 2599,
      dailyRate: "₹28 / day",
      badge: "SAVE 14%",
      perks: [
        "Everything in Monthly pass",
        "1x Fitness & posture assessment",
        "Quarterly nutrition & wellness blueprint",
        "Infrared sauna relaxation access",
      ],
    },
    {
      id: "WOM-6M",
      name: "Women 6 Months",
      duration: "6 Months (Semi-Annual)",
      durationMonths: 6,
      price: 4499,
      dailyRate: "₹25 / day",
      badge: "RECOMMENDED",
      isPopular: true,
      perks: [
        "Everything in Quarterly pass",
        "Priority reformer & studio booking",
        "2x Guest Passes per quarter",
        "Monthly trainer technique reviews",
      ],
    },
    {
      id: "WOM-12M",
      name: "Women Annual VIP",
      duration: "12 Months (Full Year)",
      durationMonths: 12,
      price: 6999,
      dailyRate: "₹19 / day",
      badge: "MAX SAVINGS",
      perks: [
        "All-inclusive 365-day VIP pass",
        "Full access to all 5 studio concepts",
        "Unlimited cold plunge & infrared recovery",
        "5x VIP Guest Day Passes",
        "M S Fitness luxury wellness kit",
      ],
    },
  ],
  COUPLE: [
    {
      id: "COUPLE-1M",
      name: "Couple Dual Access Pass",
      duration: "Monthly Partner Pass",
      durationMonths: 1,
      price: 1999,
      dailyRate: "₹66 / day for two",
      badge: "SPECIAL PARTNER TIER",
      isPopular: true,
      perks: [
        "Complete dual access for two partners",
        "Synchronized workout shifts & class booking",
        "Full access to all functional & free-weight zones",
        "Sauna, cold plunge & recovery amenities",
      ],
    },
  ],
};

export default function PricingMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("MEN");

  return (
    <section id="pricing" className="py-24 md:py-36 bg-void border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-mega text-gold-500">
            Transparent Pricing
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-black uppercase tracking-widest text-white leading-tight">
            MEMBERSHIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-200">TIERS</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Zero hidden fees. Full access to world-class coaching, dedicated session shifts, and hyper-recovery. Select your tier below.
          </p>

          {/* Category Toggle Tabs */}
          <div className="mt-8 sm:mt-10 inline-flex flex-wrap justify-center p-1.5 rounded-2xl sm:rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 max-w-full">
            {(["MEN", "WOMEN", "COUPLE"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-7 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {cat === "MEN" ? "Men's Studio" : cat === "WOMEN" ? "Women's Studio" : "Couple Pass"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          className={`grid gap-6 ${
            selectedCategory === "COUPLE"
              ? "max-w-md mx-auto grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {PRICING_DATA[selectedCategory].map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 bg-zinc-950/80 border transition-all duration-500 hover:-translate-y-2 ${
                tier.isPopular
                  ? "border-gold-500/80 shadow-[0_0_35px_-5px_rgba(229,169,60,0.25)] ring-1 ring-gold-500/50"
                  : "border-zinc-800/80 hover:border-zinc-600"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gold-500 px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-black shadow-md">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                  {tier.duration}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold uppercase tracking-wider text-white">
                  {tier.name}
                </h3>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white">
                    ₹{tier.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
                  {tier.dailyRate} • Standard Membership Rate
                </span>

                {/* Perks List */}
                <div className="mt-8 space-y-3 pt-6 border-t border-zinc-900">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 font-light">
                      <Check className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-10">
                <Link
                  href={`/admin/members/new?plan=${tier.id}`}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    tier.isPopular
                      ? "bg-gold-500 text-black hover:bg-gold-400 hover:scale-[1.02] shadow-lg shadow-gold-500/20"
                      : "bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-gold-500 hover:text-black hover:scale-[1.02] shadow-md"
                  }`}
                >
                  <span>Select Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Membership Terms Footnote */}
        <div className="mt-16 text-center text-xs text-zinc-500 max-w-2xl mx-auto">
          <p>
            * Prices are inclusive of all club access amenities. Membership activation date is customizable upon joining. Official tax receipt and digital entry pass issued immediately upon enrollment.
          </p>
        </div>
      </div>
    </section>
  );
}
