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
    <section ref={ref} id="facilities" className="relative py-32 px-6 overflow-hidden bg-background text-foreground border-b border-gold/20">
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase">★ THOUGHTFUL COMFORTS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground font-bold">
            Thoughtful <span className="text-heritage-gradient italic">Comforts</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilitiesData?.map((facility: any) => {
            const isCustomImage = facility.icon?.startsWith("http://") || facility.icon?.startsWith("https://") || facility.icon?.startsWith("/");
            const Icon = (LucideIcons as any)[facility.icon] || LucideIcons.Sparkles;
            return (
              <div
                key={facility.id}
                className="f-card group relative p-8 bg-white border border-heritage-brown/20 hover:border-heritage-brown transition-all duration-700 hover:-translate-y-2 shadow-md hover:shadow-xl rounded-sm"
              >
                {/* Carved brown corners */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-heritage-brown/40" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-heritage-brown/40" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-heritage-brown/40" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-heritage-brown/40" />

                {/* Brown Icon Badge */}
                <div className="relative mx-auto mb-6 w-16 h-12 rounded-sm bg-heritage-brown text-white border border-heritage-brown/50 shadow-md flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  {isCustomImage ? (
                    <img src={facility.icon} alt={facility.label} className="w-7 h-7 object-contain filter drop-shadow brightness-0 invert" />
                  ) : (
                    <Icon className="text-white font-bold" size={22} />
                  )}
                </div>
                <h3 className="font-display text-xl text-heritage-brown text-center mb-3 group-hover:text-heritage-orange transition-colors duration-500 font-bold">
                  {facility.label}
                </h3>
                <p className="font-serif italic text-heritage-brown/80 text-center text-sm leading-relaxed font-medium">
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
