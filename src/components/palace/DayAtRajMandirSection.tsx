import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Sun, Coffee, Sparkles } from "lucide-react";
import { DustParticles } from "./DustParticles";
import previewImg from "@/assets/gallery-4.jpg";

gsap.registerPlugin(ScrollTrigger);

export const DayAtRajMandirSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".day-preview-text > *", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        y: 35,
        opacity: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: "power3.out",
      });
      gsap.from(".day-preview-img", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        scale: 1.05,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-28 px-6 bg-royal-deep text-white overflow-hidden border-b border-gold/20">
      <div className="absolute inset-0 marble-texture opacity-30 pointer-events-none" />
      <DustParticles count={15} />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* TEXT COLUMN */}
        <div className="day-preview-text lg:col-span-7 space-y-6">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs font-bold flex items-center gap-2">
            <Clock size={14} className="text-gold" />
            ★ PALACE JOURNEY ★
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-bold leading-tight">
            A Day at <span className="text-gold-gradient italic">Raj Mandir</span>
          </h2>

          <div className="divider-gold max-w-xs">
            <span className="text-gold text-lg">❖</span>
          </div>

          <p className="font-serif text-xl md:text-2xl italic text-ivory/95 leading-relaxed font-medium">
            From your first morning chai to dinner beneath the Jodhpur sky, discover how a day at Raj Mandir can become part of your journey.
          </p>

          <p className="font-serif text-base text-ivory/70 leading-relaxed max-w-2xl">
            Experience the rhythmic flow of a royal day — sunrise chai, rooftop breakfasts, heritage walking tours, lazy afternoon siestas, and sunset dinner overlooking Mehrangarh Fort.
          </p>

          {/* Quick Highlights Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold/20">
            <div className="text-center p-3 bg-royal-deep/60 border border-gold/20 rounded-sm">
              <Coffee size={18} className="mx-auto text-gold mb-1" />
              <div className="font-serif-sc text-[10px] tracking-wider text-gold">MORNING CHAI</div>
            </div>
            <div className="text-center p-3 bg-royal-deep/60 border border-gold/20 rounded-sm">
              <Sun size={18} className="mx-auto text-gold mb-1" />
              <div className="font-serif-sc text-[10px] tracking-wider text-gold">GOLDEN HOUR</div>
            </div>
            <div className="text-center p-3 bg-royal-deep/60 border border-gold/20 rounded-sm">
              <Sparkles size={18} className="mx-auto text-gold mb-1" />
              <div className="font-serif-sc text-[10px] tracking-wider text-gold">ROOFTOP DINING</div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/day-at-raj-mandir"
              className="inline-flex items-center gap-3 font-serif-sc tracking-[0.3em] text-xs px-8 py-4 bg-gradient-gold text-royal-deep font-bold rounded-sm shadow-gold hover:scale-[1.02] transition-all duration-500 uppercase"
            >
              EXPLORE YOUR DAY <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* IMAGE COLUMN */}
        <div className="day-preview-img lg:col-span-5 relative aspect-[4/5] jharokha-frame shadow-gold overflow-hidden">
          <img
            src={previewImg}
            alt="A Day at Raj Mandir preview visual"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-gold/30 rounded-sm text-center">
            <span className="font-serif-sc text-[10px] tracking-[0.3em] text-gold uppercase block">07:30 AM — 09:00 PM</span>
            <span className="font-serif italic text-sm text-ivory">A Full Day Experience</span>
          </div>
        </div>

      </div>
    </section>
  );
};
