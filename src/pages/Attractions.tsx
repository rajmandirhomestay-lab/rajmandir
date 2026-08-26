import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useAttractions, useHomepageSections, useSliderSettings, usePageHero } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";
import { MapPin } from "lucide-react";

import heroImgFallback from "@/assets/story-bluecity.jpg";

gsap.registerPlugin(ScrollTrigger);

import { Link } from "react-router-dom";

const fallbackCards = [
  { id: "blue-city", slug: "blue-city", title: "Blue City", location: "Navchokiya, Old City", short_description: "Narrow, winding indigo blue lanes right below Mehrangarh Fort." },
  { id: "mehrangarh", slug: "mehrangarh", title: "Mehrangarh Fort", location: "1.2 km from Raj Mandir", short_description: "Imposing fortress on a rocky cliff overlooking Marwar." },
  { id: "jaswant-thada", slug: "jaswant-thada", title: "Jaswant Thada", location: "1.8 km from Raj Mandir", short_description: "Carved white marble cenotaph shining in desert sunlight." },
  { id: "clock-tower", slug: "clock-tower", title: "Clock Tower & Sardar Market", location: "800 m from Raj Mandir", short_description: "Bustling heritage market famed for spices and handicrafts." },
  { id: "umaid-bhawan", slug: "umaid-bhawan", title: "Umaid Bhawan Palace", location: "6.5 km from Raj Mandir", short_description: "Grand Art Deco royal residence built of golden sandstone." }
];

const Attractions = () => {
  const { data: attractions } = useAttractions();
  const { data: sections } = useHomepageSections();
  const { data: sliderSettings } = useSliderSettings('attractions');
  const { data: pageHero } = usePageHero('attractions');
  const containerRef = useRef<HTMLDivElement>(null);

  const displayAttractions = (attractions && attractions.length > 0) ? attractions : fallbackCards;
  const heroImgFallbackCurrent = sections?.find(s => s.section_key === 'attractions')?.content?.image_url || heroImgFallback;

  const defaultSliderSettings: SliderSettings = {
    slide_speed: 4000,
    transition_type: "slide",
    autoplay: true,
    pause_on_hover: true,
    show_dots: true,
    show_arrows: true,
    loop: true,
    animation_duration: 1000
  };
  const finalSliderSettings = sliderSettings || defaultSliderSettings;

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
  }, [displayAttractions]);

  return (
    <PageShell
      title="Nearby Attractions — Raj Mandir Jodhpur"
      description="Explore the heritage of Jodhpur, from the Mehrangarh Fort to the vibrant Sardar Market."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "LOCAL EXPERIENCES & NEARBY WONDERS"}
        title={pageHero?.title || "Nearby"}
        accent={pageHero?.accent || "Wonders"}
        subtitle={pageHero?.subtitle || "A curated local guide to the most magnificent sights around the Blue City."}
        image={pageHero?.image_url || heroImgFallbackCurrent}
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
                 {displayAttractions.map((item: any) => {
                    const itemTarget = item.slug || item.id || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <Link 
                        to={`/attractions/${itemTarget}`} 
                        key={item.id || item.title} 
                        className="attraction-card group block text-left bg-card border border-gold/20 p-4 rounded-sm shadow-frame hover:shadow-gold hover:border-gold/50 transition-all duration-500"
                      >
                         <div className="aspect-square mb-6 overflow-hidden shadow-frame border border-gold/20 relative group-hover:shadow-gold transition-all duration-700">
                               <UnifiedSlider 
                                  images={item.attraction_images?.length > 0 ? item.attraction_images.map((img: any) => img.image_url) : [heroImgFallbackCurrent]} 
                                  settings={finalSliderSettings as unknown as SliderSettings}
                                  className="w-full h-full pointer-events-none"
                               />
                            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-royal-deep/80 backdrop-blur-md border border-gold/30 text-gold font-serif-sc text-[9px] tracking-widest uppercase">
                               {item.location || "Nearby"}
                            </div>
                         </div>
                         <div className="text-center px-2 pb-4">
                            <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-2 uppercase font-semibold">HERITAGE WONDER</div>
                            <h3 className="font-display text-3xl text-foreground group-hover:text-gold transition-colors duration-500 uppercase tracking-tight">{item.title}</h3>
                            <div className="w-8 h-px bg-gold/30 mx-auto my-3" />
                            <p className="font-serif text-sm text-muted-foreground leading-relaxed italic px-2 line-clamp-3 mb-4">
                               {item.short_description || item.full_description}
                            </p>
                            <span className="inline-block font-serif-sc text-xs tracking-[0.2em] text-gold group-hover:text-gold-glow uppercase font-bold">
                              DISCOVER STORY →
                            </span>
                         </div>
                      </Link>
                    );
                 })}
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
