import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as LucideIcons from "lucide-react";
import { useHomepageAmenities } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

export const Facilities = () => {
  const ref = useRef<HTMLElement>(null);
  const { data: facilitiesData, isLoading } = useHomepageAmenities();

  useEffect(() => {
    if (isLoading || !facilitiesData) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".f-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [facilitiesData, isLoading]);

  return (
    <section ref={ref} id="facilities" className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-[#082438] via-[#0b3854] to-[#082438] text-white border-b border-[#0284c7]/30">
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 font-serif-sc text-[#38bdf8] tracking-[0.5em] text-xs font-bold uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">★ THOUGHTFUL COMFORTS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-white font-bold">
            Thoughtful <span className="text-[#38bdf8] italic">Comforts</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-[#38bdf8] text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilitiesData?.map((facility: any) => {
            const Icon = (LucideIcons as any)[facility.icon] || LucideIcons.Sparkles;
            return (
              <div
                key={facility.id}
                className="f-card group relative p-8 bg-[#061e30]/90 backdrop-blur-md border border-[#0284c7]/40 hover:border-[#38bdf8] transition-all duration-700 hover:-translate-y-2 shadow-lg shadow-[#0284c7]/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] rounded-sm"
              >
                {/* Carved corners */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#38bdf8]/60" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#38bdf8]/60" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#38bdf8]/60" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#38bdf8]/60" />

                <div className="relative mx-auto mb-6 w-16 h-12 jharokha bg-gradient-to-br from-[#0284c7]/30 to-[#06b6d4]/20 border border-[#38bdf8]/50 flex items-center justify-center group-hover:bg-[#0284c7]/40 transition-all duration-700">
                  <Icon className="text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" size={20} />
                </div>
                <h3 className="font-display text-xl text-white text-center mb-3 group-hover:text-[#38bdf8] transition-colors duration-500 font-bold">
                  {facility.label}
                </h3>
                <p className="font-serif italic text-sky-100/80 text-center text-sm leading-relaxed font-medium">
                  {facility.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
