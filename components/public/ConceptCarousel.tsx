"use client";

import { useState } from "react";
import { Dumbbell, Flame, Bike, HeartPulse, Sparkles, ChevronRight, X, Clock, Target, Award } from "lucide-react";

interface Concept {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  duration: string;
  calories: string;
  intensity: string;
  equipment: string;
  image: string;
}

const CONCEPTS: Concept[] = [
  {
    id: "titan-shred",
    name: "TITAN SHRED",
    category: "STRENGTH & METCON",
    tagline: "Uncompromising functional conditioning & power output.",
    description: "Built for those who refuse to settle. A high-tempo fusion of Olympic lifting basics, dumbbell clusters, ski-erg sprints, and weighted sled pushes that fires up your anaerobic threshold and melts body fat.",
    duration: "50 MIN",
    calories: "700–900 KCAL",
    intensity: "MAXIMUM (9/10)",
    equipment: "Barbells, SkiErg, Sleds, Dumbbells",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "apex-box",
    name: "APEX BOX",
    category: "RHYTHM BOXING",
    tagline: "Nightclub acoustics meet precision knockout conditioning.",
    description: "Step into the dark. 10 explosive rounds alternating between hydro-bag punch combinations and floor strength circuits, set to custom bass-heavy mixes that push you past your perceived limits.",
    duration: "45 MIN",
    calories: "600–850 KCAL",
    intensity: "HIGH (8.5/10)",
    equipment: "Aqua Punching Bags, Free Weights",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "velocity-ride",
    name: "VELOCITY RIDE",
    category: "STUDIO CYCLING",
    tagline: "High-cadence rhythm climbs and synchronized sprints.",
    description: "An immersive indoor cycling journey where visual light beams pulse with RPM cadences. Heavy gear climbs and sprint intervals designed to build leg power and cardiovascular stamina.",
    duration: "45 MIN",
    calories: "500–750 KCAL",
    intensity: "VERY HIGH (8/10)",
    equipment: "Stages SC3 Studio Bikes",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "reformer-lab",
    name: "REFORMER LAB",
    category: "ATHLETIC PILATES",
    tagline: "Deep core stability, eccentric lengthening, and muscle tone.",
    description: "The most demanding reformer experience in the city. High-tension carriage work targeting glute activation, postural alignment, and slow-twitch muscle burnout without joint impact.",
    duration: "50 MIN",
    calories: "350–500 KCAL",
    intensity: "CONTROLLED BURN (7.5/10)",
    equipment: "Custom Reformer Beds & Jumpboards",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "cryo-recovery",
    name: "CRYO & RECOVERY",
    category: "HYPER WELLNESS",
    tagline: "Contrast therapy: 80°C Infrared Sauna to 4°C Ice Plunge.",
    description: "Accelerate athletic recovery and cellular rejuvenation. Combine medical-grade infrared heat therapy with cold immersion plunge pools and Normatec dynamic compression to flush lactic acid in minutes.",
    duration: "40 MIN",
    calories: "RESTORATION & FLUSH",
    intensity: "RESTORATIVE (ZEN)",
    equipment: "Cold Plunges, Infrared Saunas, Compression Boots",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function ConceptCarousel() {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  return (
    <section id="concepts" className="py-24 bg-void border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <span className="text-xs font-mono uppercase tracking-mega text-gold-500">
              Signature Modalities
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-widest text-white">
              OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">CONCEPTS</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm font-light text-zinc-400 max-w-md tracking-wider">
            From the toughest strength conditioning to revolutionary recovery suites, our 5 signature concepts leave you in a natural state of power.
          </p>
        </div>

        {/* Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONCEPTS.map((concept) => (
            <div
              key={concept.id}
              onClick={() => setSelectedConcept(concept)}
              className="group dark-image-overlay-card relative h-[420px] rounded-3xl overflow-hidden cursor-pointer bg-zinc-950 border border-zinc-800/80 transition-all duration-500 hover:border-gold-500/50 hover:-translate-y-1"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${concept.image})` }}
              />

              {/* Dark Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

              {/* Top Category Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="inline-block rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest text-gold-400 border border-gold-500/30">
                  {concept.category}
                </span>
              </div>

              {/* Bottom Details */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 flex flex-col">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white">
                  {concept.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-light line-clamp-2 leading-relaxed">
                  {concept.tagline}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300 group-hover:text-gold-400 transition-colors">
                  <span>Explore Class Details</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Details Modal */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedConcept(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 sm:top-6 sm:right-6 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold">
              {selectedConcept.category}
            </span>
            <h3 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white">
              {selectedConcept.name}
            </h3>
            <p className="mt-4 text-xs sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
              {selectedConcept.description}
            </p>

            {/* Spec Grid */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800/80">
              <div>
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-500">
                  <Clock className="h-3.5 w-3.5 text-gold-500" /> Duration
                </span>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">{selectedConcept.duration}</p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-500">
                  <Flame className="h-3.5 w-3.5 text-crimson-500" /> Burn
                </span>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">{selectedConcept.calories}</p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-500">
                  <Target className="h-3.5 w-3.5 text-amber-500" /> Intensity
                </span>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">{selectedConcept.intensity}</p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-zinc-500">
                  <Award className="h-3.5 w-3.5 text-cyan-400" /> Gear
                </span>
                <p className="mt-1 text-xs font-medium text-zinc-950 dark:text-white truncate">{selectedConcept.equipment}</p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setSelectedConcept(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold text-zinc-500 hover:text-black dark:hover:text-white text-center"
              >
                Close
              </button>
              <a
                href="#pricing"
                onClick={() => setSelectedConcept(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-400 transition-transform active:scale-95 text-center"
              >
                Book with Membership
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
