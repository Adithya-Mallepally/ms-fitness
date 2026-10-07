"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ExpandingCards() {
  const cards = [
    {
      title: "FIRST-TIMER",
      subtitle: "New to M S Fitness?",
      description: "Experience our complimentary guided walkthrough, movement screening, and introductory session.",
      buttonText: "Discover Experience",
      href: "#about",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop",
    },
    {
      title: "MEMBERSHIPS",
      subtitle: "Join the Standard",
      description: "Unlimited studio workouts, dedicated training zones for Men & Women, and hyper-recovery access.",
      buttonText: "View Fee Tiers",
      href: "#pricing",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-void">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 lg:flex-row">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="group dark-image-overlay-card relative flex h-[400px] w-full overflow-hidden rounded-3xl bg-zinc-950 no-underline transition-[width,transform] duration-700 ease-out lg:h-[520px] lg:w-1/2 lg:hover:w-[66%] border border-zinc-800/80 hover:border-gold-500/50"
          >
            {/* Background Image with Zoom on hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${card.image})` }}
            />

            {/* Gradient Scrim */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-8 lg:p-12">
              <span className="text-xs font-mono uppercase tracking-widest text-gold-500">
                {card.subtitle}
              </span>

              <h3 className="font-display my-2 text-3xl font-extrabold uppercase leading-tight tracking-widest text-white lg:text-4xl">
                {card.title}
              </h3>

              {/* Reveal text on hover on desktop */}
              <div className="overflow-hidden transition-all duration-500 max-h-24 opacity-90 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                <p className="pt-2 text-sm text-zinc-300 font-light leading-relaxed max-w-md">
                  {card.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:text-gold-400">
                  <span>{card.buttonText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
