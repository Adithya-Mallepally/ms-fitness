"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Shield, User, Clock, Phone, MapPin } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4 md:px-10 pointer-events-none">
        {/* Floating Menu Button (Saints & Stars signature) */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="pointer-events-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
        </button>

        {/* Center Minimal Logo */}
        <Link
          href="/"
          className="pointer-events-auto font-display text-base sm:text-lg md:text-2xl font-black uppercase tracking-wider sm:tracking-mega text-white transition-opacity hover:opacity-80 px-2 truncate"
        >
          M S <span className="text-gold-500">FITNESS</span>
        </Link>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href="/portal"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 transition-colors hover:text-white glass-pill"
          >
            <User className="h-3.5 w-3.5 text-gold-500" />
            <span>Member</span>
          </Link>

          {/* Theme Switcher beside Member */}
          <ThemeToggle />

          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white glass-pill"
          >
            <Shield className="h-3.5 w-3.5 text-zinc-400" />
            <span>Staff</span>
          </Link>

          <Link
            href="/#pricing"
            className="inline-flex items-center rounded-full bg-white px-3.5 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-gold-500 hover:scale-105 active:scale-95"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Join Now</span>
          </Link>
        </div>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        />
      )}

      {/* Slide-out Drawer (Saints & Stars Navigation Style) */}
      <nav
        aria-label="Navigation drawer"
        className={`fixed top-0 left-0 bottom-0 z-50 flex h-full w-full max-w-full flex-col justify-between overflow-y-auto bg-void border-r border-zinc-800/80 p-6 sm:p-10 md:w-[540px] transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Close Button & Brand */}
        <div className="flex items-center justify-between pb-6 sm:pb-8 border-b border-zinc-800/60">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="font-display text-lg sm:text-xl font-black uppercase tracking-wider sm:tracking-mega text-white"
          >
            M S <span className="text-gold-500">FITNESS</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 text-zinc-300 transition-colors hover:bg-white hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="my-auto flex flex-col gap-4 sm:gap-5 py-6 sm:py-8">
          {[
            { label: "About M S Fitness", href: "/#about", tag: "Tribe" },
            { label: "Signature Concepts", href: "/#concepts", tag: "5 Studios" },
            { label: "Membership Plans", href: "/#pricing", tag: "From ₹999" },
            { label: "Operating Timings", href: "/#timings", tag: "5 AM - 10 PM" },
            { label: "Luxury Amenities", href: "/#amenities", tag: "Recovery" },
            { label: "Member Portal", href: "/portal", tag: "Active Pass" },
            { label: "Staff Admin ERP", href: "/admin", tag: "Operations" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between border-b border-zinc-900/80 pb-2.5 sm:pb-3 transition-colors hover:border-zinc-700"
            >
              <span className="font-display text-xl sm:text-2xl md:text-3xl font-extralight uppercase tracking-wider sm:tracking-widest text-zinc-200 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white group-hover:font-medium">
                {item.label}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 group-hover:text-gold-500">
                {item.tag}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Footer Contact & Session Hours */}
        <div className="border-t border-zinc-800/60 pt-6 flex flex-col gap-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold-500 flex-shrink-0" />
            <span>Mon–Sat: 5–10 AM &amp; 5–10 PM | Sun: 5–10 AM</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-500 flex-shrink-0" />
            <span>Plot 42, Apex Boulevard, Cyber City</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold-500 flex-shrink-0" />
            <span>Desk: +91 98765 43210</span>
          </div>
        </div>
      </nav>
    </>
  );
}
