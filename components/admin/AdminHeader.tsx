"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Clock, ExternalLink, Shield, Sparkles, User, Menu } from "lucide-react";

const TITLE_MAP: Record<string, string> = {
  "/admin": "Operations Dashboard",
  "/admin/attendance": "Entrance Scanner & Attendance",
  "/admin/members": "Member Directory",
  "/admin/members/new": "New Member Joining",
  "/admin/renewals": "Expiry & Renewal Pipeline",
  "/admin/plans": "Membership Pricing & Rates",
  "/admin/payments": "Payment & Collection Ledger",
  "/admin/reports": "Financial & Operational Reports",
  "/admin/settings": "Settings & Operating Shifts",
};

interface AdminHeaderProps {
  onOpenSidebar?: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname();

  // Find matching title or prefix for /admin/members/[id]
  let currentTitle = TITLE_MAP[pathname] || "Staff ERP";
  if (pathname.startsWith("/admin/members/") && pathname !== "/admin/members/new") {
    currentTitle = "Member Profile & History";
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      {/* Left: Hamburger Menu (Mobile/Tablet) + Section Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile / Tablet Menu Button */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            aria-label="Open staff navigation menu"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-gold-500 hover:text-black transition-colors lg:hidden active:scale-95 flex-shrink-0"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 block font-semibold truncate">
            M S Fitness ERP
          </span>
          <h2 className="font-display text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-zinc-950 dark:text-white truncate">
            {currentTitle}
          </h2>
        </div>

        {/* Shift Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex-shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Shift Active</span>
          <span className="text-zinc-500">5–10 AM &amp; 5–10 PM</span>
        </div>
      </div>

      {/* Right: Quick Links & THEME TOGGLE (Prominently placed on every page) */}
      <div className="flex items-center gap-3">
        {/* Public Website Link */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <span>Website</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Member Portal Link */}
        <Link
          href="/portal"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <User className="h-3 w-3 text-gold-500" />
          <span>Member Pass</span>
        </Link>

        {/* PROMINENT THEME TOGGLE FOR ALL ADMIN PAGES */}
        <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <ThemeToggle />
        </div>

        {/* Staff Role Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400">
            <Shield className="h-4 w-4" />
          </div>
          <div className="text-left text-xs">
            <p className="font-bold text-zinc-900 dark:text-white leading-tight">Admin Desk</p>
            <span className="text-[10px] font-mono text-zinc-500">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
