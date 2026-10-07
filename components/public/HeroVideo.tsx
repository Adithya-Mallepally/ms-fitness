"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";

export default function HeroVideo() {
  return (
    <section id="hero-section" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-void">
      {/* Background Video Loop (Commercial Royalty-Free Fitness Footage) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-60 scale-105"
        poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-heavy-ropes-in-a-gym-44161-large.mp4"
          type="video/mp4"
        />
        {/* Fallback secondary video source */}
        <source
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Luxury Scrim & Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-black/50 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-void/40 to-void" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-16">
        {/* Subtle pill badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-gold-500 animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-300">
            Exclusive Luxury Fitness Club
          </span>
        </div>

        {/* Big Bold Architectural Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider sm:tracking-widest text-white leading-[1.08] drop-shadow-2xl">
          NEXT LEVEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">FITNESS</span>
        </h1>

        <p className="mt-5 sm:mt-6 max-w-2xl text-xs sm:text-base md:text-lg font-light tracking-[0.05em] sm:tracking-[0.08em] text-zinc-300 leading-relaxed px-2 sm:px-0">
          Where raw strength meets high-end luxury. Uncompromising boutique studios, hyper-recovery cryo suites, and world-class programming tailored to your discipline.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <Link
            href="#pricing"
            className="w-full sm:w-auto inline-flex h-12 sm:h-14 items-center justify-center rounded-full bg-white px-7 sm:px-9 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-gold-500 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Explore Memberships
          </Link>

          <Link
            href="#concepts"
            className="w-full sm:w-auto inline-flex h-12 sm:h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 sm:px-8 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/40"
          >
            Our Concepts
          </Link>
        </div>
      </div>

      {/* Saints & Stars Signature Animated Scroll Beam Indicator */}
      <Link
        href="#about"
        aria-label="Scroll down"
        className="group absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer transition-opacity hover:opacity-100 opacity-70"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
          Scroll
        </span>
        <div className="relative h-12 w-1 overflow-hidden rounded-full bg-white/20">
          <span className="animate-scroll-beam absolute inset-x-0 top-0 block h-4 rounded-full bg-white shadow-[0_0_8px_white]" />
        </div>
      </Link>
    </section>
  );
}
