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
    <section ref={ref} id="facilities" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 sandstone-texture opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">★ THOUGHTFUL COMFORTS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Thoughtful <span className="text-gold-gradient italic">Comforts</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilitiesData?.map((facility: any) => {
            const Icon = (LucideIcons as any)[facility.icon] || LucideIcons.Sparkles;
            return (
              <div
                key={facility.id}
                className="f-card group relative p-8 bg-card/60 backdrop-blur-sm border border-gold/20 hover:border-gold/60 transition-all duration-700 hover:-translate-y-2 hover:shadow-gold"
              >
                {/* Carved corners */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/60" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/60" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/60" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/60" />

                <div className="relative mx-auto mb-6 w-16 h-12 jharokha bg-gradient-gold/20 border border-gold/50 flex items-center justify-center group-hover:bg-gradient-gold/40 transition-all duration-700">
                  <Icon className="text-gold" size={20} />
                </div>
                <h3 className="font-display text-xl text-foreground text-center mb-3 group-hover:text-gold transition-colors duration-500">
                  {facility.label}
                </h3>
                <p className="font-serif italic text-muted-foreground text-center text-sm leading-relaxed">
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
