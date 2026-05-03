import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const reviews = [
  {
    quote:
      "Stepping into Raj Mandir felt like entering a painting. Every arch, every shadow, every brass lamp told a story older than the city itself.",
    name: "Anaïs Laurent",
    place: "Paris, France",
  },
  {
    quote:
      "The most cinematic stay of my life. We sat on the rooftop watching the blue city turn gold — it was as if time had been bribed to slow down.",
    name: "Rohan Mehta",
    place: "Mumbai, India",
  },
  {
    quote:
      "Not a hotel. A heritage. The family treats you as a guest in their ancestral home, and you leave feeling slightly more royal than when you arrived.",
    name: "Eleanor Whitfield",
    place: "London, UK",
  },
];

export const Reviews = () => {
  const [i, setI] = useState(0);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % reviews.length), 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!quoteRef.current) return;
    gsap.fromTo(
      quoteRef.current,
      { opacity: 0, y: 30, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.6, ease: "power3.out" }
    );
  }, [i]);

  const r = reviews[i];

  return (
    <section id="reviews" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.1),transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="font-serif-sc text-gold tracking-[0.5em] text-xs mb-4">★ VOICES OF GUESTS ★</div>
        <h2 className="font-display text-5xl md:text-6xl text-foreground">
          Words from the <span className="text-gold-gradient italic">courtyard</span>
        </h2>
        <div className="divider-gold mt-6 max-w-md mx-auto">
          <span className="font-display text-gold text-xl">❖</span>
        </div>

        <div className="mt-16 min-h-[280px] flex items-center justify-center">
          <div ref={quoteRef} className="px-4">
            <div className="font-display text-gold text-6xl leading-none mb-6">“</div>
            <blockquote className="font-serif italic text-2xl md:text-3xl leading-relaxed text-foreground/90 max-w-3xl mx-auto">
              {r.quote}
            </blockquote>
            <div className="mt-10">
              <div className="font-serif-sc tracking-[0.3em] text-sm text-foreground">{r.name}</div>
              <div className="font-serif italic text-muted-foreground mt-1">{r.place}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show review ${idx + 1}`}
              className={`h-px transition-all duration-700 ${
                i === idx ? "w-12 bg-gold" : "w-6 bg-foreground/20 hover:bg-gold/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
