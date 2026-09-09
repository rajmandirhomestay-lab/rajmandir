import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-[#071f30] via-[#0b3854] to-[#071927] border-b border-[#0284c7]/30 text-white">
      {/* Ambient Radial Cyan Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.2),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 marble-texture opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-20">
          <div className="eyebrow mb-4 font-serif-sc text-[#38bdf8] tracking-[0.5em] text-xs font-bold uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">★ THE GUESTBOOK ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-white font-bold">
            Whispers from <span className="text-[#38bdf8] italic">our guests</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-[#38bdf8] text-xl">❖</span></div>
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
  const isLongText = quote && quote.length > 120;

  return (
    <div
      className="fs-card relative p-10 bg-[#061e30]/90 backdrop-blur-md border border-[#0284c7]/40 shadow-lg shadow-[#0284c7]/10 hover:border-[#38bdf8] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-700 h-full flex flex-col rounded-sm"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-6 jharokha bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#0284c7] flex items-center justify-center text-white font-display text-xs shadow-md border border-cyan-300/40">
        ❖
      </div>
      <div className="font-display text-[#38bdf8] text-5xl leading-none mb-3 opacity-90 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">“</div>
      
      <div className="flex-grow flex flex-col">
        <blockquote className={`font-serif italic text-lg leading-relaxed text-sky-100/90 transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {quote}
        </blockquote>
        
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-left mt-2 text-[#38bdf8] font-serif-sc tracking-widest text-[10px] hover:text-white transition-colors font-semibold"
          >
            {isExpanded ? "READ LESS ↑" : "READ MORE ↓"}
          </button>
        )}
      </div>

      <div className="divider-gold my-6"><span className="text-[#38bdf8] text-xs">❖</span></div>
      <div className="text-center mt-auto">
        <div className="font-serif-sc tracking-[0.3em] text-xs text-white font-semibold">{name}</div>
        <div className="font-serif italic text-sky-200/70 mt-1 text-sm">{place}</div>
      </div>
    </div>
  );
};
