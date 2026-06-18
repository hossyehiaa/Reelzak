"use client";

const ITEMS = [
  "Ideation",
  "AI Generation",
  "Editing",
  "Color Grading",
  "Sound Design",
  "Motion",
  "Delivery",
];

export function Marquee() {
  // Duplicate the list so the track can loop seamlessly via -50% transform
  const loop = [...ITEMS, ...ITEMS];
  return (
    <section
      aria-hidden="true"
      className="relative border-y border-white/[0.06] py-6 overflow-hidden"
    >
      <div className="marquee-track gap-12 whitespace-nowrap">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="font-display text-2xl md:text-3xl font-medium tracking-tight text-white/80">
              {item}
            </span>
            <span className="text-white/20">✦</span>
          </div>
        ))}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
