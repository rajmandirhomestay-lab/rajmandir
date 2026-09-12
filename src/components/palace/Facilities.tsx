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
    <section ref={ref} id="facilities" className="relative py-32 px-6 overflow-hidden bg-[#f6f0e6] text-[#091a28] border-b border-[#e5dac9]">
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 font-serif-sc text-[#b45309] tracking-[0.5em] text-xs font-bold uppercase">★ THOUGHTFUL COMFORTS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-[#091a28] font-bold">
            Thoughtful <span className="text-[#145992] italic">Comforts</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-[#b45309] text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilitiesData?.map((facility: any) => {
            const Icon = (LucideIcons as any)[facility.icon] || LucideIcons.Sparkles;
            return (
              <div
                key={facility.id}
                className="f-card group relative p-8 bg-white/95 backdrop-blur-md border border-[#e5dac9] hover:border-[#145992] transition-all duration-700 hover:-translate-y-2 shadow-md hover:shadow-xl rounded-sm"
              >
                {/* Carved corners */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/40" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/40" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/40" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/40" />

                <div className="relative mx-auto mb-6 w-16 h-12 jharokha bg-gradient-to-br from-[#145992]/10 to-gold/10 border border-[#145992]/30 flex items-center justify-center group-hover:bg-[#145992]/20 transition-all duration-700">
                  <Icon className="text-[#145992]" size={20} />
                </div>
                <h3 className="font-display text-xl text-[#091a28] text-center mb-3 group-hover:text-[#145992] transition-colors duration-500 font-bold">
                  {facility.label}
                </h3>
                <p className="font-serif italic text-[#2c4d6f] text-center text-sm leading-relaxed font-medium">
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
