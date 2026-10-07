import { Wind, Droplets, Key, Coffee, Sparkles, Shield } from "lucide-react";

export default function AmenitiesShowcase() {
  const amenities = [
    {
      icon: Droplets,
      title: "Contrast Cold Plunge",
      desc: "3°C filtered ice plunge pools engineered to rapidly eliminate cellular inflammation.",
    },
    {
      icon: Wind,
      title: "Infrared Sauna Suites",
      desc: "Full-spectrum medical infrared heat targeting deep muscle tissue repair and detox.",
    },
    {
      icon: Key,
      title: "Biometric Smart Lockers",
      desc: "Keyless, pin-secured lockers with built-in internal device charging ports.",
    },
    {
      icon: Sparkles,
      title: "Luxury Grooming Lounges",
      desc: "Equipped with Dyson Supersonic hair care, rain showers, and botanical organic toiletries.",
    },
    {
      icon: Coffee,
      title: "Artisan Protein Bar",
      desc: "Fresh cold-pressed juices, grass-fed isolate recovery shakes, and single-origin espresso.",
    },
    {
      icon: Shield,
      title: "Sterile Air & Hygiene",
      desc: "Hospital-grade HEPA filtration and continuous antimicrobial disinfection systems.",
    },
  ];

  return (
    <section id="amenities" className="py-24 bg-void border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-xs font-mono uppercase tracking-mega text-gold-500">
              The Experience
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-black uppercase tracking-widest text-white">
              LUXURY <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">AMENITIES</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm font-light text-zinc-400 max-w-md">
            We refuse to cut corners. Every square foot is curated with meticulous attention to detail to restore mind, muscle, and focus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800/80 transition-all duration-300 hover:border-zinc-600 hover:-translate-y-1"
            >
              <item.icon className="h-7 w-7 text-gold-500" />
              <h3 className="mt-6 font-display text-lg font-bold uppercase tracking-wider text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-zinc-400 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
