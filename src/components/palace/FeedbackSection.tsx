import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useReviews } from "@/lib/api";

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
  const { data: dbReviews } = useReviews();

  const displayCards = dbReviews && dbReviews.filter(r => r.is_featured).length > 0
    ? dbReviews.filter(r => r.is_featured).slice(0, 3).map(r => ({
        quote: r.comment,
        name: r.guest_name,
        place: r.guest_location || "Global Guest",
      }))
    : cards;

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
          {displayCards.map((c, i) => (
            <FeedbackCard key={i} quote={c.quote} name={c.name} place={c.place} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeedbackCard = ({ quote, name, place }: { quote: string; name: string; place: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = quote && quote.length > 120; // Roughly 3 lines depending on screen size

  return (
    <div
      className="fs-card relative p-10 marble-texture border border-gold/30 shadow-frame hover:shadow-gold transition-all duration-700 h-full flex flex-col"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-6 jharokha bg-gradient-gold flex items-center justify-center text-royal-deep font-display text-xs">
        ❖
      </div>
      <div className="font-display text-gold text-5xl leading-none mb-3">“</div>
      
      <div className="flex-grow flex flex-col">
        <blockquote className={`font-serif italic text-lg leading-relaxed text-foreground/90 transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {quote}
        </blockquote>
        
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-left mt-2 text-gold font-serif-sc tracking-widest text-[10px] hover:text-gold-glow transition-colors"
          >
            {isExpanded ? "READ LESS ↑" : "READ MORE ↓"}
          </button>
        )}
      </div>

      <div className="divider-gold my-6"><span className="text-gold text-xs">❖</span></div>
      <div className="text-center mt-auto">
        <div className="font-serif-sc tracking-[0.3em] text-xs text-foreground">{name}</div>
        <div className="font-serif italic text-muted-foreground mt-1 text-sm">{place}</div>
      </div>
    </div>
  );
};
