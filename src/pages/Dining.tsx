import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useDiningAreas, useDishes, useHomepageSections } from "@/lib/api";
import { ContentSlider } from "@/components/palace/ContentSlider";

import heroImgFallback from "@/assets/page-dining-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const Dining = () => {
  const { data: areas } = useDiningAreas();
  const { data: dishes } = useDishes();
  const { data: sections } = useHomepageSections();
  const containerRef = useRef<HTMLDivElement>(null);

  const heroImg = sections?.find(s => s.section_key === 'dining')?.content?.image_url || heroImgFallback;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Editorial text reveals
      gsap.utils.toArray(".editorial-text").forEach((text: any) => {
        gsap.fromTo(text,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: text,
              start: "top 85%",
            }
          }
        );
      });

      // Dish cards animation
      gsap.fromTo(".dish-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".dishes-grid",
            start: "top 80%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [areas, dishes]);

  return (
    <PageShell
      title="Royal Dining — Raj Mandir"
      description="Taste the heritage of Rajasthan through curated culinary experiences at Raj Mandir."
    >
      <PageHero
        eyebrow="CULINARY HERITAGE"
        title="Feasts of"
        accent="the Maharajas"
        subtitle="Where ancient recipes meet the romance of the Blue City under the stars."
        image={heroImg}
        alt="Royal dining setup"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        {/* Section 1: Dining Areas (Experiences) */}
        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto space-y-32">
              {areas?.map((area, idx) => (
                 <div key={area.id} className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 lg:gap-24`}>
                    <div className="w-full md:w-3/5 aspect-[16/10] overflow-hidden border border-gold/20 shadow-frame relative group">
                       <ContentSlider 
                          images={area.dining_area_images.map((img: any) => img.image_url)} 
                          className="w-full h-full"
                          autoPlay={true}
                       />
                       <div className="absolute top-6 left-6 z-20 px-4 py-1 bg-royal-deep/80 backdrop-blur-md border border-gold/30 text-gold font-display text-sm">
                          {String(idx + 1).padStart(2, '0')}
                       </div>
                    </div>
                    
                    <div className="w-full md:w-2/5 editorial-text">
                       <div className="font-serif-sc text-gold tracking-[0.4em] text-xs mb-6 uppercase">
                          {area.theme_type} · {area.tagline}
                       </div>
                       <h2 className="font-display text-5xl md:text-6xl text-foreground mb-8 leading-tight">
                          {area.title}
                       </h2>
                       <div className="w-12 h-px bg-gold mb-8" />
                       <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-6 italic">
                          {area.description}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* Section 2: Special Dishes Showcase */}
        <section className="relative py-32 px-6 bg-card/30 border-y border-gold/10 overflow-hidden">
          <div className="absolute inset-0 lattice-pattern opacity-5" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24 editorial-text">
              <div className="font-serif-sc text-gold tracking-[0.4em] text-xs mb-4 uppercase">SIGNATURE CREATIONS</div>
              <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4">
                The Royal <span className="text-gold-gradient italic">Menu</span>
              </h2>
              <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
            </div>

            <div className="dishes-grid grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {dishes?.map((dish, i) => (
                <div key={dish.id} className="dish-card group relative">
                  <div className="aspect-square mb-6 overflow-hidden jharokha-frame border border-gold/20 shadow-gold transition-transform duration-700 group-hover:scale-[1.02]">
                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-royal-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  <div className="text-center">
                    <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-2 uppercase">{dish.category}</div>
                    <h3 className="font-display text-2xl text-foreground mb-3">{dish.name}</h3>
                    <p className="font-serif text-muted-foreground/80 text-sm leading-relaxed mb-4 italic px-4 line-clamp-2">{dish.description}</p>
                    <div className="font-serif text-gold tracking-widest text-lg">{dish.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Reservation CTA */}
        <section className="relative py-32 px-6 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 editorial-text max-w-2xl mx-auto">
             <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">Ready for a Royal Feast?</h2>
             <p className="font-serif italic text-lg text-muted-foreground mb-10">Reserve your table to experience Jodhpur's finest heritage dining.</p>
             <a href="/contact" className="inline-block font-serif-sc tracking-[0.3em] text-xs px-10 py-5 bg-gradient-gold text-royal-deep rounded-sm hover:shadow-gold transition-all duration-700">
                BOOK A TABLE
             </a>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Dining;
