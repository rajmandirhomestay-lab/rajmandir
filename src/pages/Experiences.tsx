import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useExperiences, useHomepageSections, useSliderSettings } from "@/lib/api";
import { ContentSlider } from "@/components/palace/ContentSlider";
import { Clock, MapPin, Sparkles } from "lucide-react";

import heroImgFallback from "@/assets/page-experiences-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const Experiences = () => {
  const { data: experiences } = useExperiences();
  const { data: sections } = useHomepageSections();
  const { data: sliderSettings } = useSliderSettings('experiences');
  const containerRef = useRef<HTMLDivElement>(null);

  const heroImg = sections?.find(s => s.section_key === 'experiences')?.content?.image_url || heroImgFallback;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".experience-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".experience-grid",
            start: "top 80%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [experiences]);

  return (
    <PageShell
      title="Royal Experiences — Raj Mandir"
      description="Immerse yourself in the cultural tapestry of Jodhpur through curated royal experiences."
    >
      <PageHero
        eyebrow="IMMERSIVE JOURNEYS"
        title="Curated"
        accent="Experiences"
        subtitle="Step beyond the palace walls and discover the soul of the Blue City."
        image={heroImg}
        alt="Royal experience"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                 <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] mb-4 uppercase">THE COLLECTION</div>
                 <h2 className="font-display text-5xl md:text-6xl text-foreground">Royal Safaris & <span className="text-gold-gradient italic">Cultural Walks</span></h2>
                 <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
              </div>

              <div className="experience-grid grid md:grid-cols-2 gap-12 lg:gap-20">
                 {experiences?.map((exp: any) => (
                    <div key={exp.id} className="experience-card group">
                       <div className="aspect-[16/10] mb-8 overflow-hidden shadow-frame border border-gold/20 relative">
                          <ContentSlider 
                             images={exp.experience_images?.map((img: any) => img.image_url) || []} 
                             settings={sliderSettings}
                             className="w-full h-full"
                          />
                       </div>
                       <div className="space-y-6">
                           <div className="flex items-center gap-2 text-gold font-serif-sc text-[10px] tracking-widest uppercase">
                              <MapPin size={12} className="shrink-0" /> {exp.type || "ROYAL EXPERIENCE"}
                           </div>
                           <h3 className="font-display text-4xl text-foreground group-hover:text-gold transition-colors duration-500">{exp.title}</h3>
                           <div className="w-12 h-px bg-gold/30" />
                           <p className="font-serif text-lg text-muted-foreground/80 leading-relaxed italic line-clamp-3">
                              {exp.short_description || exp.full_description}
                           </p>
                           <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-gold/10">
                              <a href="/contact" className="ml-auto font-serif-sc text-[10px] tracking-widest text-gold hover:text-white transition-colors">
                                 INQUIRE NOW →
                              </a>
                           </div>
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Floating elements */}
        <div className="absolute bottom-20 left-10 opacity-10 rotate-12 pointer-events-none hidden lg:block">
           <Sparkles size={200} className="text-gold" />
        </div>
      </div>
    </PageShell>
  );
};

export default Experiences;
