import prisma from "@/lib/prisma";
import { Settings, Clock, Phone, MapPin, Receipt, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany({
    orderBy: { category: "asc" },
  });

  const settingsMap = settings.reduce((acc: Record<string, string>, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
            Club Configuration &amp; Facilities
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white">
            SETTINGS &amp; TIMINGS
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Configure dynamic operating shifts, club identity, receipt templates, and contact info.
          </p>
        </div>
      </div>

      {/* Operating Shifts Section */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-6 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold-600 dark:text-gold-500" /> Facility Operating Shifts &amp; Hours
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">Morning Shift</span>
            <p className="mt-2 font-mono text-base font-bold text-zinc-950 dark:text-white">
              {settingsMap["timings_morning"] || "5:00 AM – 10:00 AM"}
            </p>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Mon – Sat (5 Hours)</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">Evening Shift</span>
            <p className="mt-2 font-mono text-base font-bold text-zinc-950 dark:text-white">
              {settingsMap["timings_evening"] || "5:00 PM – 10:00 PM"}
            </p>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Mon – Sat (5 Hours)</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">Sunday Session</span>
            <p className="mt-2 font-mono text-base font-bold text-zinc-950 dark:text-white">
              {settingsMap["timings_sunday"] || "5:00 AM – 10:00 AM"}
            </p>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 block">Morning Only</span>
          </div>
        </div>
      </div>

      {/* Club Identity & Contact */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-6 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold-600 dark:text-gold-500" /> Club Branding &amp; Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs">
          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-500 mb-1 font-semibold">Gym Name</label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white font-semibold">
              {settingsMap["gym_name"] || "M S FITNESS"}
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-500 mb-1 font-semibold">Contact Phone</label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white font-mono">
              {settingsMap["contact_phone"] || "+91 98765 43210"}
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-500 mb-1 font-semibold">Contact Email</label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white">
              {settingsMap["contact_email"] || "reception@msfitness.club"}
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-500 mb-1 font-semibold">Receipt Prefix</label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-gold-600 dark:text-gold-400 font-mono font-bold">
              {settingsMap["receipt_prefix"] || "MSF-REC"}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Roles & Access */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-4 shadow-sm">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Staff Access &amp; Operational Roles
        </h3>

        <div className="space-y-3 text-xs">
          {[
            { role: "Super Administrator", email: "admin@msfitness.com", perms: "Full system administration, fee versioning, reports, audit logs" },
            { role: "Receptionist", email: "reception@msfitness.com", perms: "Daily operations, member registration, payment recording, receipts" },
            { role: "Floor Manager", email: "manager@msfitness.com", perms: "Dashboard KPIs, expiry pipeline monitoring, revenue auditing" },
          ].map((u, i) => (
            <div key={i} className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-zinc-950 dark:text-white uppercase">{u.role}</span>
                <span className="block text-[11px] text-zinc-500 font-mono">{u.email}</span>
              </div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-light max-w-sm sm:text-right">
                {u.perms}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
