import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    quote: "The silence here is the most luxurious thing I have ever owned for a week.",
    name: "Isabella Romano",
    place: "Florence",
  },
  {
    quote: "We were not guests. We were small characters in a story the palace was still writing.",
    name: "Arjun & Kavya",
    place: "Bengaluru",
  },
  {
    quote: "Every meal felt like a ceremony. Every sunset, an inheritance.",
    name: "Hiroshi Tanaka",
    place: "Kyoto",
  },
];

export const FeedbackSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fs-card",
        { y: 80, opacity: 0, rotateX: 10 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
      gsap.to(".fs-card", {
        y: -8,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.4, from: "random" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="eyebrow mb-4">★ THE GUESTBOOK ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Whispers from <span className="text-gold-gradient italic">our guests</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className="fs-card relative p-10 marble-texture border border-gold/30 shadow-frame hover:shadow-gold transition-all duration-700"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-6 jharokha bg-gradient-gold flex items-center justify-center text-royal-deep font-display text-xs">
                ❖
              </div>
              <div className="font-display text-gold text-5xl leading-none mb-3">“</div>
              <blockquote className="font-serif italic text-lg leading-relaxed text-foreground/90 min-h-[140px]">
                {c.quote}
              </blockquote>
              <div className="divider-gold my-6"><span className="text-gold text-xs">❖</span></div>
              <div className="text-center">
                <div className="font-serif-sc tracking-[0.3em] text-xs text-foreground">{c.name}</div>
                <div className="font-serif italic text-muted-foreground mt-1 text-sm">{c.place}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/feedback"
            className="inline-flex font-serif-sc tracking-[0.3em] text-xs px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-royal-deep transition-all duration-700"
          >
            SIGN OUR GUESTBOOK
          </Link>
        </div>
      </div>
    </section>
  );
};
