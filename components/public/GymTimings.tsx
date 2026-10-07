import { Clock, Sun, Moon, CalendarCheck, ShieldAlert } from "lucide-react";

export default function GymTimings() {
  const shifts = [
    {
      session: "MORNING SHIFT",
      timing: "5:00 AM – 10:00 AM",
      days: "Monday through Saturday",
      icon: Sun,
      color: "text-amber-400",
      description: "Dedicated peak morning conditioning, early bird strength circuits & open gym floor.",
    },
    {
      session: "EVENING SHIFT",
      timing: "5:00 PM – 10:00 PM",
      days: "Monday through Saturday",
      icon: Moon,
      color: "text-indigo-400",
      description: "High-voltage post-work training, heavy resistance blocks & guided studio concepts.",
    },
    {
      session: "SUNDAY SPECIAL",
      timing: "5:00 AM – 10:00 AM",
      days: "Sunday Morning Only",
      icon: CalendarCheck,
      color: "text-gold-400",
      description: "Recovery workouts, endurance conditioning, and deep contrast hydrotherapy.",
    },
  ];

  return (
    <section id="timings" className="py-24 bg-void border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-mega text-gold-500">
            Operating Schedule
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-black uppercase tracking-widest text-white">
            SESSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">TIMINGS</span>
          </h2>
          <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
            Engineered around your life. Two dedicated 5-hour daily shifts ensuring optimal floor space, zero overcrowding, and undivided trainer attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((s, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                  {s.days}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                {s.session}
              </h3>
              <p className="mt-2 font-mono text-2xl font-black text-gold-500">
                {s.timing}
              </p>

              <p className="mt-6 text-xs text-zinc-400 font-light leading-relaxed border-t border-zinc-900 pt-4">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
