"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Clock, 
  Layers, 
  CreditCard, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Flame,
  CheckCircle2,
  ExternalLink,
  QrCode,
  X
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Entrance Scanner", href: "/admin/attendance", icon: QrCode },
  { label: "Member Directory", href: "/admin/members", icon: Users },
  { label: "New Joining", href: "/admin/members/new", icon: UserPlus },
  { label: "Expiry & Renewals", href: "/admin/renewals", icon: Clock },
  { label: "Plans & Fee Updates", href: "/admin/plans", icon: Layers },
  { label: "Payment Ledger", href: "/admin/payments", icon: CreditCard },
  { label: "Financial Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings & Shifts", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-5 h-screen overflow-y-auto transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        lg:static lg:w-64 lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
          <div>
            <Link
              href="/"
              onClick={onClose}
              className="font-display text-xl font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2"
            >
              M S <span className="text-gold-500">FITNESS</span>
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1 block">
              Operations &amp; Management ERP
            </span>
          </div>

          {/* Close button on mobile & tablet */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white lg:hidden transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Operating Shift Status Indicator */}
        <div className="my-5 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shift Active</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-light">
            Morning: 5–10 AM | Evening: 5–10 PM
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-bold shadow-md shadow-zinc-950/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-white dark:text-black" : "text-zinc-500 dark:text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Return Links */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1.5">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors px-2.5 py-2 rounded-xl"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Public Site
          </span>
          <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
        </Link>
        <Link
          href="/portal"
          onClick={onClose}
          className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors px-2.5 py-2 rounded-xl"
        >
          <span>Member Self-Portal</span>
          <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
        </Link>
      </div>
    </aside>
  );
}
