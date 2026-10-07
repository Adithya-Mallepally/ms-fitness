"use client";

import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  UserCheck, 
  Clock, 
  Download, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Flame, 
  Sparkles,
  ExternalLink,
  Plus
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
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
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
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [manualSearchResults, setManualSearchResults] = useState<any[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
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
      // Audio playback safely ignored if browser restricts
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
  }, []);

  // Process a scanned or submitted code
  async function handleVerifyPayload(payloadString: string, allowOverride = false) {
    if (!payloadString.trim()) return;
    setIsScanning(true);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData: payloadString.trim(),
          verifiedBy: cameraActive ? "ENTRANCE_CAMERA" : "DESK_SCANNER",
          allowOverride,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        // Expired membership requiring renewal or staff override
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
          message: data.error || "Member not found. Check code or registration.",
          member: { id: "", memberCode: payloadString, name: "Unregistered Pass", phone: "N/A", gender: "N/A" },
        });
        playAudioFeedback("error");
      } else {
        // Successful check-in
        setScanResult(data);
        if (data.membershipStatus === "EXPIRING_SOON") {
          playAudioFeedback("warning");
        } else {
          playAudioFeedback("success");
        }
        // Refresh today's attendance table
        loadTodayAttendance();
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        reason: "ERROR",
        message: err.message || "Failed to communicate with attendance server.",
        member: { id: "", memberCode: payloadString, name: "Network Error", phone: "N/A", gender: "N/A" },
      });
      playAudioFeedback("error");
    } finally {
      setIsScanning(false);
      setManualInput("");
      // Keep hardware scanner input in focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  // Toggle Camera Scanner using dynamic html5-qrcode import
  async function toggleCamera() {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }

  async function startCamera() {
    setCameraError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!Html5Qrcode) throw new Error("QR engine could not load.");

      const qrScanner = new Html5Qrcode("qr-camera-viewport");
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" }, // Prefer rear camera on mobile / tablet
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Detected QR code successfully
          handleVerifyPayload(decodedText);
        },
        () => {
          // Frame without QR code (normal)
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera scanner error:", err);
      setCameraError(err.message || "Camera permission denied or camera not found.");
      setCameraActive(false);
    }
  }

  async function stopCamera() {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error("Error stopping camera:", err);
    } finally {
      setCameraActive(false);
      html5QrCodeRef.current = null;
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          html5QrCodeRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Search members for manual desk check-in
  async function searchMembersForManual(query: string) {
    setManualSearchQuery(query);
    if (!query.trim()) {
      setManualSearchResults([]);
      return;
    }
    setSearchingMembers(true);
    try {
      const res = await fetch(`/api/portal/lookup?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data) {
        setManualSearchResults([data]);
      } else {
        setManualSearchResults([]);
      }
    } catch {
      setManualSearchResults([]);
    } finally {
      setSearchingMembers(false);
    }
  }

  // Manual Check In by Member ID
  async function executeManualCheckIn(memberId: string) {
    setIsScanning(true);
    try {
      const res = await fetch("/api/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, allowOverride: true }),
      });
      const data = await res.json();
      if (res.ok) {
        playAudioFeedback("success");
        setIsManualModalOpen(false);
        setScanResult({
          success: true,
          shift: "DESK",
          shiftLabel: "Desk Check-In",
          member: data.member,
          message: "Checked in manually at front desk.",
        });
        loadTodayAttendance();
      } else {
        playAudioFeedback("error");
        alert(data.error || "Manual check-in failed.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setIsScanning(false);
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
      {/* Top Header & Operational Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-[11px] font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Live Entrance Check-In Station
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-zinc-950 dark:text-white">
            Entrance Scanner &amp; Attendance Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Scan dynamic member pass QR codes via camera or USB laser scanner to mark real-time attendance and verify membership validity.
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

          {/* Manual Member Check-in Modal Trigger */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-colors"
          >
            <UserCheck className="h-4 w-4 text-gold-500" />
            <span>Manual Check-In</span>
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

      {/* Main Grid: Scanner Left & Live Stats/Verification Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Live Scanner & Hardware Input (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scanner Card */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-gold-500">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                    Entrance Scanner
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    Optical Camera + 2D Laser Gun
                  </span>
                </div>
              </div>

              {/* Camera Activation Button */}
              <button
                onClick={toggleCamera}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  cameraActive
                    ? "bg-crimson-500/10 border-crimson-500/30 text-crimson-600 dark:text-crimson-400"
                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-gold-500 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5 text-gold-500" />
                    <span>Start Camera</span>
                  </>
                )}
              </button>
            </div>

            {/* Camera Viewport Area */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 min-h-[260px] flex items-center justify-center">
              {/* HTML5 QR Code Mount Node */}
              <div
                id="qr-camera-viewport"
                ref={scannerContainerRef}
                className={`w-full ${cameraActive ? "block" : "hidden"}`}
              />

              {!cameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-700/80 mx-auto flex items-center justify-center text-gold-500">
                    <Camera className="h-7 w-7" />
                  </div>
                  <h4 className="font-display text-sm font-bold uppercase text-white">
                    Camera Scanner Inactive
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Click <strong>Start Camera</strong> to enable front desk webcam/tablet scanning, or use the instant laser input below.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-display text-xs font-bold uppercase tracking-wider transition-transform active:scale-95"
                  >
                    Activate Camera
                  </button>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-4 text-center">
                  <XCircle className="h-8 w-8 text-crimson-500 mb-2" />
                  <p className="text-xs text-crimson-400 max-w-xs font-medium">{cameraError}</p>
                  <button
                    onClick={() => setCameraError("")}
                    className="mt-3 text-xs underline text-zinc-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Hardware Laser Scanner & Manual Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPayload(manualInput);
              }}
              className="mt-5 space-y-2"
            >
              <label className="text-[11px] font-mono uppercase text-zinc-600 dark:text-zinc-400 font-semibold block">
                Instant Laser / Keyboard Input:
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Scan QR or enter Member ID (e.g. MSF-1014)..."
                  className="w-full pl-4 pr-24 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-gold-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isScanning || !manualInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-colors"
                >
                  {isScanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify"}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                Supports USB barcode scanners, Bluetooth laser guns, or typing Member ID/Phone number.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Instant Verification Card & Attendance Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Verification Result Display */}
          {scanResult ? (
            <div
              className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 transition-all animate-fadeIn shadow-lg ${
                scanResult.success
                  ? scanResult.membershipStatus === "EXPIRING_SOON"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-100"
                    : "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                  : "bg-crimson-500/10 border-crimson-500/40 text-crimson-950 dark:text-crimson-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      scanResult.success
                        ? scanResult.membershipStatus === "EXPIRING_SOON"
                          ? "bg-amber-500 text-black"
                          : "bg-emerald-500 text-black"
                        : "bg-crimson-500 text-white"
                    }`}
                  >
                    {scanResult.success ? (
                      scanResult.membershipStatus === "EXPIRING_SOON" ? (
                        <AlertTriangle className="h-7 w-7" />
                      ) : (
                        <CheckCircle2 className="h-7 w-7" />
                      )
                    ) : (
                      <XCircle className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      {scanResult.success
                        ? scanResult.membershipStatus === "EXPIRING_SOON"
                          ? "CHECK-IN RECORDED • RENEWAL DUE"
                          : "ADMISSION GRANTED • VERIFIED"
                        : "ACCESS RESTRICTED • EXPIRED PASS"}
                    </span>
                    <h2 className="font-display text-2xl font-black uppercase tracking-wide">
                      {scanResult.member.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-mono opacity-80 mt-0.5">
                      <span>ID: {scanResult.member.memberCode}</span>
                      <span>•</span>
                      <span>{scanResult.member.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shift Tag */}
                {scanResult.shift && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10">
                    {scanResult.shift} SHIFT
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-black/10 dark:border-white/10 text-xs">
                {scanResult.membership && (
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-[10px] font-mono uppercase opacity-70 block">Enrolled Plan:</span>
                    <span className="font-bold text-sm uppercase">{scanResult.membership.planName}</span>
                    <span className="block text-[11px] opacity-80 mt-0.5 font-mono">
                      Valid till:{" "}
                      {new Date(scanResult.membership.endDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <span className="text-[10px] font-mono uppercase opacity-70 block">Pass Status:</span>
                  <span className="font-bold text-sm uppercase">
                    {scanResult.daysRemaining !== undefined
                      ? scanResult.daysRemaining >= 0
                        ? `${scanResult.daysRemaining} Days Remaining`
                        : `Expired ${Math.abs(scanResult.daysRemaining)} Days Ago`
                      : scanResult.reason}
                  </span>
                  {scanResult.isRepeatCheckIn && (
                    <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      Repeat Visit (First check-in today recorded)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Expired / Expiring Passes */}
              {scanResult.requiresOverride && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleVerifyPayload(scanResult.member.memberCode, true)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Staff Override (One-Time Admission)
                  </button>
                  <Link
                    href={`/admin/members/${scanResult.member.id}`}
                    className="px-4 py-2 rounded-xl bg-gold-500 text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-gold-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>Instant Plan Renewal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500 space-y-2">
              <ShieldCheck className="h-10 w-10 mx-auto text-gold-500 opacity-80" />
              <h3 className="font-display text-base font-bold uppercase text-zinc-900 dark:text-white">
                Scanner Ready For Pass
              </h3>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Aim the member&apos;s dynamic QR code at the camera or scan their Member ID to instantly verify and mark attendance.
              </p>
            </div>
          )}

          {/* Daily Shift Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Check-Ins</span>
              <h4 className="mt-1 font-display text-2xl font-black text-zinc-950 dark:text-white">
                {stats.total}
              </h4>
              <span className="text-[10px] font-mono text-emerald-500 mt-1 block">
                {stats.uniqueMembers} Unique Members
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Morning Shift</span>
              <h4 className="mt-1 font-display text-2xl font-black text-zinc-950 dark:text-white">
                {stats.morningCount}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">5:00 AM – 12:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Evening Shift</span>
              <h4 className="mt-1 font-display text-2xl font-black text-zinc-950 dark:text-white">
                {stats.eveningCount}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">4:00 PM – 10:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Renewal Alerts</span>
              <h4 className="mt-1 font-display text-2xl font-black text-amber-500">
                {stats.expiringWarnings}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Pass expiring soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Today's Live Attendance Feed */}
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

          {/* Filters & Search */}
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
                <th className="py-3 px-4">Verification</th>
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
                    No attendance records found for today. Scan passes to record check-ins.
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-crimson-400">
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

      {/* Manual Check-in Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display text-lg font-bold uppercase">Manual Member Check-In</h3>
                <p className="text-xs text-zinc-400">Search member by phone or ID to admit without phone</p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={manualSearchQuery}
                onChange={(e) => searchMembersForManual(e.target.value)}
                placeholder="Type member phone number or Member ID..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 font-mono"
                autoFocus
              />
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {searchingMembers ? (
                <p className="text-center text-xs text-zinc-500 py-4">Searching...</p>
              ) : manualSearchResults.length === 0 && manualSearchQuery ? (
                <p className="text-center text-xs text-zinc-500 py-4">No matching registered member found.</p>
              ) : (
                manualSearchResults.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm">
                        {m.firstName} {m.lastName}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {m.memberCode} • {m.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => executeManualCheckIn(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase"
                    >
                      Admit Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
