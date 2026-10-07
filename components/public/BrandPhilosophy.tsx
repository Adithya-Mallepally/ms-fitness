import { Flame, ShieldCheck, Zap, Trophy } from "lucide-react";

export default function BrandPhilosophy() {
  return (
    <section id="about" className="relative py-24 md:py-36 bg-void border-t border-zinc-900 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <span className="text-xs font-mono uppercase tracking-mega text-gold-500">
          Philosophy &amp; Culture
        </span>

        <h2 className="mt-4 font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest text-white leading-tight">
          THIS IS OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-200">TRIBE</span>
        </h2>

        <p className="mt-8 text-base sm:text-lg md:text-xl font-light tracking-[0.05em] text-zinc-300 leading-relaxed max-w-3xl mx-auto">
          At <strong className="text-white font-medium">M S Fitness</strong>, you define your line and we give you everything we&apos;ve got to help you cross it. Discover the next-level fitness experience that refuses to cut corners when it comes to atmosphere, equipment quality, and community vibe. Welcome to the sanctuary.
        </p>

        {/* Feature Grid with Luxury Cards */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          {[
            {
              icon: Flame,
              number: "05",
              title: "Specialty Concepts",
              desc: "From Titan Shred to Cryo Recovery",
            },
            {
              icon: Zap,
              number: "10h",
              title: "Daily Dedicated Shifts",
              desc: "Morning & evening peak workout hours",
            },
            {
              icon: ShieldCheck,
              number: "100%",
              title: "Tailored Zones",
              desc: "Dedicated Men & Women studio tiers",
            },
            {
              icon: Trophy,
              number: "VIP",
              title: "Hyper Recovery",
              desc: "Sauna, ice plunge & recovery lounge",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <item.icon className="h-6 w-6 text-gold-500 transition-transform group-hover:scale-110" />
                <span className="text-xs font-mono text-zinc-500">{item.number}</span>
              </div>
              <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
