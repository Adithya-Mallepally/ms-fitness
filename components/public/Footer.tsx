import Link from "next/link";
import { Shield, User, ArrowUpRight, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 py-16 sm:py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 pb-12 sm:pb-16 border-b border-zinc-200 dark:border-zinc-900">
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-display text-2xl font-black uppercase tracking-wider sm:tracking-mega text-zinc-950 dark:text-white inline-block"
            >
              M S <span className="text-gold-500">FITNESS</span>
            </Link>
            <p className="mt-4 text-xs font-light text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              Where luxury meets raw strength. Uncompromising boutique studios, dedicated training shifts, and medical-grade recovery.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-800 dark:text-zinc-300 hover:border-gold-500/50 hover:text-black dark:hover:text-white transition-colors"
              >
                <User className="h-3 w-3 text-gold-500" />
                <span>Member Portal</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:border-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <Shield className="h-3 w-3" />
                <span>Staff ERP</span>
              </Link>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-zinc-950 dark:text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link href="#about" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="#concepts" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Signature Concepts
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Membership Plans &amp; Fees
                </Link>
              </li>
              <li>
                <Link href="#timings" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Session Timings &amp; Shifts
                </Link>
              </li>
              <li>
                <Link href="#amenities" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Recovery &amp; Amenities
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-zinc-950 dark:text-white mb-4">
              Club Details
            </h4>
            <ul className="space-y-3 text-xs font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <span>Plot 42, Apex Boulevard, Cyber City</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gold-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gold-500 flex-shrink-0" />
                <span>contact@msfitness.club</span>
              </li>
            </ul>
          </div>

          {/* Operating Shifts */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-zinc-950 dark:text-white mb-4">
              Daily Shifts
            </h4>
            <div className="space-y-2 text-xs font-light">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">Morning Session</p>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono">5:00 AM – 10:00 AM</p>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900">
                <p className="font-medium text-zinc-900 dark:text-white">Evening Session</p>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono">5:00 PM – 10:00 PM</p>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900">
                <p className="font-medium text-zinc-900 dark:text-white">Sunday Session</p>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono">5:00 AM – 10:00 AM (Morning Only)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4 text-center sm:text-left">
          <p>© 2026 M S Fitness. All rights reserved. Zero-copyright compliant original platform.</p>
          <div className="flex gap-6">
            <Link href="/portal" className="hover:text-zinc-800 dark:hover:text-zinc-300">
              Member Pass
            </Link>
            <Link href="/admin" className="hover:text-zinc-800 dark:hover:text-zinc-300">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
