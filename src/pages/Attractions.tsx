import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useAttractions, useHomepageSections, useSliderSettings } from "@/lib/api";
import { ContentSlider } from "@/components/palace/ContentSlider";
import { MapPin } from "lucide-react";

import heroImgFallback from "@/assets/story-bluecity.jpg";

gsap.registerPlugin(ScrollTrigger);

const Attractions = () => {
  const { data: attractions } = useAttractions();
  const { data: sections } = useHomepageSections();
  const { data: sliderSettings } = useSliderSettings('attractions');
  const containerRef = useRef<HTMLDivElement>(null);

  const heroImg = sections?.find(s => s.section_key === 'attractions')?.content?.image_url || heroImgFallback;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".attraction-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".attraction-grid",
            start: "top 80%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [attractions]);

  return (
    <PageShell
      title="Nearby Attractions — Raj Mandir Jodhpur"
      description="Explore the heritage of Jodhpur, from the Mehrangarh Fort to the vibrant Sardar Market."
    >
      <PageHero
        eyebrow="LANDMARKS & LEGENDS"
        title="Jodhpur"
        accent="Attractions"
        subtitle="A curated guide to the most magnificent sights around the Blue City."
        image={heroImg}
        alt="Jodhpur landmarks"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                 <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] mb-4 uppercase">STORYTELLING LANDSCAPES</div>
                 <h2 className="font-display text-5xl md:text-6xl text-foreground">The Jewel of <span className="text-gold-gradient italic">Marwar</span></h2>
                 <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
              </div>

              <div className="attraction-grid grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                 {attractions?.map((item: any) => (
                    <div key={item.id} className="attraction-card group">
                       <div className="aspect-square mb-8 overflow-hidden shadow-frame border border-gold/20 relative group-hover:shadow-gold transition-all duration-700">
                          <ContentSlider 
                             images={item.attraction_images?.map((img: any) => img.image_url) || []} 
                             settings={sliderSettings}
                             className="w-full h-full"
                          />
                          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-royal-deep/80 backdrop-blur-md border border-gold/30 text-gold font-serif-sc text-[9px] tracking-widest uppercase">
                             {item.location || "Nearby"}
                          </div>
                       </div>
                       <div className="text-center">
                          <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-2 uppercase">HERITAGE</div>
                          <h3 className="font-display text-3xl text-foreground group-hover:text-gold transition-colors duration-500 uppercase tracking-tight">{item.title}</h3>
                          <div className="w-8 h-px bg-gold/30 mx-auto my-4" />
                          <p className="font-serif text-sm text-muted-foreground/80 leading-relaxed italic px-4 line-clamp-3">
                             {item.short_description || item.full_description}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="relative py-32 px-6 text-center overflow-hidden border-t border-gold/5">
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl text-foreground mb-8">Need a Royal Guide?</h2>
              <p className="font-serif italic text-lg text-muted-foreground mb-10">We can arrange private tours and cultural walks for all nearby attractions.</p>
              <a href="/contact" className="inline-block font-serif-sc tracking-[0.3em] text-xs px-10 py-5 bg-gradient-gold text-royal-deep rounded-sm hover:shadow-gold transition-all duration-700">
                 INQUIRE ABOUT TOURS
              </a>
           </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Attractions;
