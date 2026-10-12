"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  UserCheck,
  Download,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  memberId: string;
  checkInAt: string;
  dateString: string;
  shift: string;
  status: string;
  verifiedBy: string;
  notes: string | null;
  member: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    photoUrl: string | null;
    memberships: {
      plan: {
        name: string;
      };
    }[];
  };
}

interface ScanResult {
  success: boolean;
  reason?: string;
  membershipStatus?: string;
  daysRemaining?: number;
  isRepeatCheckIn?: boolean;
  shift?: string;
  shiftLabel?: string;
  firstCheckInTime?: string;
  member: {
    id: string;
    memberCode: string;
    firstName?: string;
    lastName?: string;
    name: string;
    phone: string;
    gender: string;
  };
  membership?: {
    id: string;
    planName: string;
    durationMonths: number;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  } | null;
  attendance?: any;
  message?: string;
  requiresOverride?: boolean;
}

export default function AttendanceScannerPage() {
  const [memberId, setMemberId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentAttendances, setRecentAttendances] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    uniqueMembers: 0,
    morningCount: 0,
    eveningCount: 0,
    expiringWarnings: 0,
    overrides: 0,
  });
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("ALL");

  const inputRef = useRef<HTMLInputElement>(null);

  // Synthesize pleasant audio chime via Web Audio API
  function playAudioFeedback(type: "success" | "warning" | "error") {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "success") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "warning") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio playback safely ignored
    }
  }

  // Fetch today's attendance logs
  async function loadTodayAttendance() {
    try {
      const res = await fetch("/api/attendance/today");
      const data = await res.json();
      if (res.ok) {
        setRecentAttendances(data.attendances || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch today's attendance logs:", err);
    } finally {
      setLoadingFeed(false);
    }
  }

  useEffect(() => {
    loadTodayAttendance();
    // Auto-focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Process the submitted member ID
  async function handleVerifyMember(payloadString: string, allowOverride = false) {
    if (!payloadString.trim()) return;
    setIsVerifying(true);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData: payloadString.trim(),
          verifiedBy: "DESK_SCANNER",
          allowOverride,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setScanResult({
          success: false,
          reason: "EXPIRED",
          message: data.message,
          member: data.member,
          membership: data.membership,
          daysRemaining: data.daysRemaining,
          requiresOverride: true,
        });
        playAudioFeedback("error");
      } else if (!res.ok) {
        setScanResult({
          success: false,
          reason: "NOT_FOUND",
          message: data.error || "Member not found. Check the ID and try again.",
          member: { id: "", memberCode: payloadString, name: "Unregistered ID", phone: "N/A", gender: "N/A" },
        });
        playAudioFeedback("error");
      } else {
        setScanResult(data);
        if (data.membershipStatus === "EXPIRING_SOON") {
          playAudioFeedback("warning");
        } else {
          playAudioFeedback("success");
        }
        loadTodayAttendance();
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        reason: "ERROR",
        message: err.message || "Failed to communicate with server.",
        member: { id: "", memberCode: payloadString, name: "Network Error", phone: "N/A", gender: "N/A" },
      });
      playAudioFeedback("error");
    } finally {
      setIsVerifying(false);
      setMemberId("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // Filtered attendance feed
  const filteredAttendances = recentAttendances.filter((record) => {
    const matchesSearch =
      searchFilter === "" ||
      record.member.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      record.member.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      record.member.memberCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      record.member.phone.includes(searchFilter);

    const matchesShift = shiftFilter === "ALL" || record.shift === shiftFilter;

    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-[11px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Live Entrance Check-In Station
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-zinc-950 dark:text-white">
            Attendance Check-In
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Enter a Member ID or phone number to instantly verify membership and record attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle scan chime"
            className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border transition-colors ${
              soundEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundEnabled ? "Chime On" : "Chime Muted"}</span>
          </button>

          {/* Export CSV */}
          <a
            href="/api/attendance/export"
            download
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-black font-display uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Member ID Entry */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
            {/* Card header */}
            <div className="flex items-center gap-3 pb-5 border-b border-zinc-200 dark:border-zinc-800/80 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                  Member Check-In
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Enter Member ID or Phone Number
                </span>
              </div>
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyMember(memberId);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-600 dark:text-zinc-400 font-semibold block mb-1.5">
                  Member ID / Phone Number
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="e.g. MSF-1001 or 9810012345"
                    className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 font-mono transition-colors"
                    autoFocus
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying || !memberId.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Check In</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                Type the member's MSF code (e.g. <strong>MSF-1001</strong>) or their registered phone number, then press <strong>Enter</strong> or click <strong>Check In</strong>.
              </p>
            </form>

            {/* Quick tips */}
            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Quick Tips</p>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 font-mono">
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-500 mt-0.5">›</span>
                  Enter the member's ID card code (MSF-XXXX)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-500 mt-0.5">›</span>
                  Or enter their registered 10-digit phone number
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gold-500 mt-0.5">›</span>
                  USB barcode scanners auto-submit on scan
                </li>
              </ul>
            </div>
          </div>

          {/* Daily Shift Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Today</span>
              <h4 className="mt-1 font-display text-3xl font-black text-zinc-950 dark:text-white">
                {stats.total}
              </h4>
              <span className="text-[10px] font-mono text-emerald-500 mt-1 block">
                {stats.uniqueMembers} Unique Members
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Renewal Alerts</span>
              <h4 className="mt-1 font-display text-3xl font-black text-amber-500">
                {stats.expiringWarnings}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Pass expiring soon</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Morning Shift</span>
              <h4 className="mt-1 font-display text-3xl font-black text-zinc-950 dark:text-white">
                {stats.morningCount}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">5:00 AM – 12:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Evening Shift</span>
              <h4 className="mt-1 font-display text-3xl font-black text-zinc-950 dark:text-white">
                {stats.eveningCount}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">4:00 PM – 10:00 PM</span>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Result */}
        <div className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div
              className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 transition-all animate-fadeIn shadow-lg ${
                scanResult.success
                  ? scanResult.membershipStatus === "EXPIRING_SOON"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-100"
                    : "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                  : "bg-red-500/10 border-red-500/40 text-red-950 dark:text-red-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      scanResult.success
                        ? scanResult.membershipStatus === "EXPIRING_SOON"
                          ? "bg-amber-500 text-black"
                          : "bg-emerald-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {scanResult.success ? (
                      scanResult.membershipStatus === "EXPIRING_SOON" ? (
                        <AlertTriangle className="h-8 w-8" />
                      ) : (
                        <CheckCircle2 className="h-8 w-8" />
                      )
                    ) : (
                      <XCircle className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold block">
                      {scanResult.success
                        ? scanResult.membershipStatus === "EXPIRING_SOON"
                          ? "✓ CHECK-IN RECORDED • RENEWAL DUE"
                          : "✓ ADMISSION GRANTED • VERIFIED"
                        : scanResult.reason === "NOT_FOUND"
                        ? "✗ MEMBER NOT FOUND"
                        : "✗ ACCESS RESTRICTED • EXPIRED PASS"}
                    </span>
                    <h2 className="font-display text-3xl font-black uppercase tracking-wide mt-0.5">
                      {scanResult.member.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-mono opacity-80 mt-1">
                      <span className="font-bold">{scanResult.member.memberCode}</span>
                      <span>•</span>
                      <span>{scanResult.member.phone}</span>
                      {scanResult.shift && (
                        <>
                          <span>•</span>
                          <span className="font-bold">{scanResult.shift} SHIFT</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Details Grid */}
              {scanResult.membership && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-[10px] font-mono uppercase opacity-70 block">Enrolled Plan</span>
                    <span className="font-bold text-base uppercase block mt-0.5">{scanResult.membership.planName}</span>
                    <span className="block text-[11px] opacity-70 mt-1 font-mono">
                      Valid till:{" "}
                      {new Date(scanResult.membership.endDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-[10px] font-mono uppercase opacity-70 block">Pass Status</span>
                    <span className="font-bold text-base uppercase block mt-0.5">
                      {scanResult.daysRemaining !== undefined
                        ? scanResult.daysRemaining >= 0
                          ? `${scanResult.daysRemaining} Days Remaining`
                          : `Expired ${Math.abs(scanResult.daysRemaining)} Days Ago`
                        : scanResult.reason}
                    </span>
                    {scanResult.isRepeatCheckIn && (
                      <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        ⚠ Repeat visit — first check-in already recorded today
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons for Expired Passes */}
              {scanResult.requiresOverride && (
                <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={() => handleVerifyMember(scanResult.member.memberCode, true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Staff Override (One-Time Admission)
                  </button>
                  <Link
                    href={`/admin/members/${scanResult.member.id}`}
                    className="px-4 py-2.5 rounded-xl bg-gold-500 text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-gold-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>Renew Membership</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Clear Result */}
              <button
                onClick={() => {
                  setScanResult(null);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="mt-5 text-[11px] font-mono underline opacity-60 hover:opacity-100 transition-opacity"
              >
                Clear result and check in next member →
              </button>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 space-y-3">
              <ShieldCheck className="h-12 w-12 mx-auto text-gold-500 opacity-70" />
              <h3 className="font-display text-lg font-bold uppercase text-zinc-900 dark:text-white">
                Ready for Check-In
              </h3>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Enter a member's ID (e.g. <span className="font-mono font-bold text-gold-600">MSF-1001</span>) or registered phone number in the form on the left to verify and admit them.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Attendance Feed */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Today&apos;s Attendance Feed
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
              Real-time audit log of members admitted to the facility today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Shift Filter */}
            <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
              {["ALL", "MORNING", "EVENING"].map((s) => (
                <button
                  key={s}
                  onClick={() => setShiftFilter(s)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    shiftFilter === s
                      ? "bg-white dark:bg-zinc-800 text-gold-500 font-bold shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search member..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-gold-500 w-40 sm:w-56"
              />
            </div>

            <button
              onClick={loadTodayAttendance}
              title="Refresh feed"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Enrolled Plan</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Verified By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loadingFeed ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gold-500 mb-2" />
                    Loading attendance entries...
                  </td>
                </tr>
              ) : filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No attendance records found for today. Check in members using the form above.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((record) => {
                  const checkInTime = new Date(record.checkInAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const planName = record.member.memberships[0]?.plan.name || "N/A";

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-950 dark:text-white">
                        {checkInTime}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-950 dark:text-zinc-100 block">
                          {record.member.firstName} {record.member.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{record.member.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gold-600 dark:text-gold-500">
                        {record.member.memberCode}
                      </td>
                      <td className="py-3 px-4 uppercase text-zinc-700 dark:text-zinc-300">
                        {planName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          {record.shift}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 uppercase">
                        {record.verifiedBy.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4">
                        {record.status === "WARNING_EXPIRING" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-500">
                            <AlertTriangle className="h-3 w-3" /> Expiring Soon
                          </span>
                        ) : record.status === "OVERRIDE" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-red-400">
                            Staff Override
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/members/${record.member.id}`}
                          className="text-gold-600 dark:text-gold-500 hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                        >
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
