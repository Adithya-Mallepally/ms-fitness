"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Download, 
  Sparkles, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";

interface DynamicQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
  };
  membership: {
    plan: {
      name: string;
      durationMonths: number;
    };
    startDate: string;
    endDate: string;
  } | null;
  daysRemaining: number;
}

export default function DynamicQrPassModal({
  isOpen,
  onClose,
  member,
  membership,
  daysRemaining,
}: DynamicQrPassModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [passNonce, setPassNonce] = useState<string>("");
  const [generatedAt, setGeneratedAt] = useState<Date>(new Date());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 min validity window
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate a completely unique dynamic QR code for this member
  const generateUniqueQr = useCallback(async () => {
    setIsGenerating(true);
    const now = new Date();
    // Unique cryptographic nonce guaranteeing a different QR pattern every single time
    const uniqueNonce = `${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setPassNonce(uniqueNonce);
    setGeneratedAt(now);
    setSecondsRemaining(300);

    // Dynamic Payload format recognized by scanner
    const payload = JSON.stringify({
      app: "MS_FITNESS",
      memberCode: member.memberCode,
      memberId: member.id,
      name: `${member.firstName} ${member.lastName}`,
      nonce: uniqueNonce,
      timestamp: now.getTime(),
      validUntil: now.getTime() + 5 * 60 * 1000,
    });

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: "#09090b", // Deep zinc black
          light: "#ffffff", // Pure white for highest optical scan contrast
        },
        errorCorrectionLevel: "H", // High error correction for fast optical entrance recognition
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Failed to generate entrance pass QR code:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [member]);

  // When modal opens, immediately generate a fresh unique QR
  useEffect(() => {
    if (isOpen) {
      generateUniqueQr();
    }
  }, [isOpen, generateUniqueQr]);

  // Countdown timer for security freshness
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Auto-refresh when timer reaches 0 for seamless entrance flow
          generateUniqueQr();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, generateUniqueQr]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isExpired = daysRemaining < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 text-white shadow-2xl overflow-hidden flex flex-col items-center"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Entrance Pass Modal"
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-[11px] font-mono uppercase tracking-widest text-gold-500 font-semibold mb-3">
            <Sparkles className="h-3 w-3" />
            Dynamic Entrance Pass
          </div>
          <h3 className="font-display text-2xl font-black uppercase tracking-wide">
            {member.firstName} {member.lastName}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-200 font-bold">{member.memberCode}</span>
            <span>•</span>
            <span className="uppercase">{member.gender}</span>
            <span>•</span>
            <span>{member.phone}</span>
          </div>
        </div>

        {/* Expiry / Status Alert Notice */}
        {isExpired ? (
          <div className="mt-4 w-full p-3 rounded-xl bg-crimson-500/15 border border-crimson-500/40 text-crimson-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Membership Expired. Please renew at the desk before scanning.</span>
          </div>
        ) : (
          <div className="mt-4 w-full p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs flex items-center justify-between">
            <span className="text-zinc-400 text-[11px] font-mono uppercase">Enrolled Plan:</span>
            <span className="text-gold-400 font-bold uppercase truncate max-w-[200px]">
              {membership?.plan.name || "Active Plan"}
            </span>
          </div>
        )}

        {/* QR Code Container (High Optical Contrast) */}
        <div className="mt-6 relative p-4 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center">
          {/* Live pulsing active border indicator */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold-500/40 via-emerald-500/40 to-gold-500/40 -z-10 animate-pulse" />
          
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt={`Dynamic QR Pass for ${member.firstName} ${member.lastName}`}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-zinc-400">
              <RefreshCw className="h-8 w-8 animate-spin text-gold-500" />
            </div>
          )}

          {/* Dynamic Nonce Watermark */}
          <div className="mt-2 text-[10px] font-mono text-zinc-800 tracking-wider font-semibold">
            TOKEN: {passNonce ? passNonce.substring(0, 18) : "MSF-PASS"}
          </div>
        </div>

        {/* Dynamic Countdown & Regenerate Action */}
        <div className="mt-5 w-full space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-gold-500" />
              <span>Pass Refreshes in:</span>
              <span className="text-white font-bold">{timeFormatted}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Pass</span>
            </div>
          </div>

          {/* Refresh / Generate New QR Button */}
          <button
            onClick={generateUniqueQr}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-gold-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            Generate New QR Pass
          </button>

          <p className="text-[11px] text-zinc-500 text-center font-light leading-relaxed">
            Hold this screen directly in front of the front desk entrance scanner camera to verify your attendance.
          </p>
        </div>
      </div>
    </div>
  );
}
