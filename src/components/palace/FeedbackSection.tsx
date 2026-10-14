import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReviews, useHomepageSections } from "@/lib/api";
import { PalaceHeading } from "@/components/palace/PalaceHeading";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    quote: "The silence here is the most luxurious thing I have ever owned for a week.",
    name: "Isabella Romano",
    place: "Florence",
  },
  {
    name: "Arjun & Kavya",
    place: "Bengaluru",
    quote: "We were not guests. We were small characters in a story the palace was still writing.",
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
  const { data: sections } = useHomepageSections();

  const feedbackSection = sections?.find(s => s.section_key === 'testimonials' || s.section_key === 'feedback');
  const title = feedbackSection?.content?.title || "Whispers from our guests";

  const displayCards = dbReviews && dbReviews.filter(r => r.is_featured).length > 0
    ? dbReviews.filter(r => r.is_featured).slice(0, 3).map((r, i) => ({
        quote: r.comment || r.review_text || cards[i % cards.length].quote,
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
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-background text-foreground border-b border-gold/20">
      {/* Ambient Radial Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 marble-texture opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-20">
          <div className="eyebrow mb-4 font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase">★ THE GUESTBOOK ★</div>
          <h2 className="font-display text-5xl md:text-6xl font-bold">
            <PalaceHeading
              title={title}
              content={feedbackSection?.content}
              defaultLightPhrase="our guests"
            />
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
  const isLongText = quote && quote.length > 120;

  return (
    <div
      className="fs-card relative p-10 bg-card/95 backdrop-blur-md border border-gold/20 shadow-md hover:border-gold hover:shadow-gold transition-all duration-700 h-full flex flex-col rounded-sm text-card-foreground"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-6 jharokha bg-gradient-gold flex items-center justify-center text-royal-deep font-display text-xs shadow-md">
        ❖
      </div>
      <div className="font-display text-gold text-5xl leading-none mb-3 opacity-90">“</div>
      
      <div className="flex-grow flex flex-col">
        <blockquote className={`font-serif italic text-lg leading-relaxed text-foreground/90 transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {quote}
        </blockquote>
        
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-left mt-2 text-gold font-serif-sc tracking-widest text-[10px] hover:text-foreground transition-colors font-semibold"
          >
            {isExpanded ? "READ LESS ↑" : "READ MORE ↓"}
          </button>
        )}
      </div>

      <div className="divider-gold my-6"><span className="text-[#b45309] text-xs">❖</span></div>
      <div className="text-center mt-auto">
        <div className="font-serif-sc tracking-[0.3em] text-xs text-[#091a28] font-semibold">{name}</div>
        <div className="font-serif italic text-[#2c4d6f] mt-1 text-sm">{place}</div>
      </div>
    </div>
  );
};
