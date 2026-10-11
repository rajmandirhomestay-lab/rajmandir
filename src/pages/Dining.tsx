import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2, Utensils, Calendar, Clock, MapPin, Users, IndianRupee, ChevronRight, HeartHandshake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { useDiningAreas, useDishes, useHomepageSections, usePageHero, useEvents } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";

import heroImgFallback from "@/assets/page-dining-hero.jpg";
import eventWeddingImg from "@/assets/exp-cultural.jpg";
import eventDinnerImg from "@/assets/dining-rooftop.jpg";
import eventFolkImg from "@/assets/gallery-4.jpg";
import rooftopImg from "@/assets/gallery-4.jpg";
import dinnerImg from "@/assets/about-palace.jpg";
import eventBirthdayImg from "@/assets/gallery-1.jpg";

const initialFallbackEvents = [
  {
    id: "e1",
    title: "Weddings & Intimate Celebrations",
    category: "Weddings & Celebrations",
    short_description: "Exchange vows beneath carved arches with royal Marwari grandeur and fort views.",
    full_description: "Host your dream intimate wedding or pre-wedding ceremony surrounded by historic sandstone architecture, flower arrangements, royal folk musicians, and traditional Rajasthani banquets.",
    venue: "Courtyard & Rooftop Terrace",
    capacity: "Up to 150 Guests",
    starting_price: "On Request",
    cta_text: "Plan This Event",
    cta_link: "/contact",
    event_images: [
      { id: "eimg1", image_url: eventWeddingImg, alt_text: "Heritage Wedding at Raj Mandir" },
      { id: "eimg2", image_url: rooftopImg, alt_text: "Rooftop Celebration" }
    ]
  },
  {
    id: "e2",
    title: "Private Candlelit Rooftop Dinners",
    category: "Private Dinners",
    short_description: "A private dining experience framed by moonlight and Mehrangarh Fort.",
    full_description: "Immerse in an unforgettable candlelit evening tailor-made for anniversaries, proposals, and royal family gatherings, featuring personal butler service and custom Marwari menus.",
    venue: "Private Jharokha Balcony",
    capacity: "2 to 12 Guests",
    starting_price: "₹15,000",
    cta_text: "Reserve Private Table",
    cta_link: "/contact",
    event_images: [
      { id: "eimg3", image_url: eventDinnerImg, alt_text: "Candlelit Dinner Deck" },
      { id: "eimg4", image_url: dinnerImg, alt_text: "Palace Dining Setup" }
    ]
  },
  {
    id: "e3",
    title: "Cultural Evenings & Folk Music",
    category: "Cultural Evenings",
    short_description: "Immerse in soul-stirring Langa & Manganiyar folk performances.",
    full_description: "Gather around open fire pits as renowned Rajasthani musicians and dancers bring ancient desert tales and festive songs to life under starry Jodhpur skies.",
    venue: "Main Haveli Courtyard",
    capacity: "Up to 80 Guests",
    starting_price: "Complimentary for Guests",
    cta_text: "Enquire Now",
    cta_link: "/contact",
    event_images: [
      { id: "eimg5", image_url: eventFolkImg, alt_text: "Folk Music Night" },
      { id: "eimg6", image_url: eventBirthdayImg, alt_text: "Lantern Ambient Evening" }
    ]
  }
];

gsap.registerPlugin(ScrollTrigger);

const Dining = () => {
  const { data: dishes, isLoading: dishesLoading, error: dishesError } = useDishes();
  const { data: areas } = useDiningAreas();
  const { data: sections } = useHomepageSections();
  const { data: pageHero } = usePageHero('dining');
  const { data: dbEvents } = useEvents();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderSettings, setSliderSettings] = useState<SliderSettings | null>(null);

  const eventsList = (dbEvents && dbEvents.length > 0)
    ? dbEvents.filter((e: any) => e.active !== false)
    : initialFallbackEvents;

  const heroImgFallbackCurrent = sections?.find(s => s.section_key === 'dining')?.content?.image_url || heroImgFallback;

  useEffect(() => {
    fetch('/rest/v1/slider_settings?section_name=eq.dining', {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        setSliderSettings(data[0]);
      } else {
        setSliderSettings({
          slide_speed: 4000,
          transition_type: "slide",
          autoplay: true,
          pause_on_hover: true,
          show_dots: true,
          show_arrows: true,
          loop: true,
          animation_duration: 1000
        });
      }
    })
    .catch(() => setSliderSettings({
      slide_speed: 4000,
      transition_type: "slide",
      autoplay: true,
      pause_on_hover: true,
      show_dots: true,
      show_arrows: true,
      loop: true,
      animation_duration: 1000
    }));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Editorial text reveals
      gsap.utils.toArray(".editorial-text").forEach((text: any) => {
        gsap.fromTo(text,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: text,
              start: "top 90%",
            }
          }
        );
      });

      // Smooth entrance for dish cards without forcing opacity: 0 state
      if (dishes && dishes.length > 0) {
        gsap.from(".dish-card", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out"
        });
      }

      // Events reveal
      gsap.utils.toArray(".event-card").forEach((card: any) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
            },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [areas, dishes, eventsList]);

  return (
    <PageShell
      title="Royal Dining — Raj Mandir"
      description="Taste the heritage of Rajasthan through curated culinary experiences at Raj Mandir."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "AUTHENTIC RAJASTHANI CUISINE"}
        title={pageHero?.title || "Traditional"}
        accent={pageHero?.accent || "Flavours"}
        subtitle={pageHero?.subtitle || "Experience authentic Rajasthani cuisine and local ingredients with rooftop dining."}
        image={pageHero?.image_url || heroImgFallbackCurrent}
        alt="Royal dining setup"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        {/* Section 1: Dining Areas (Experiences) */}
        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto space-y-32">
              {areas?.map((area, idx) => (
                 <div key={area.id} className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 lg:gap-24`}>
                    <div className="w-full md:w-3/5 aspect-[16/10] overflow-hidden jharokha-frame border border-heritage-brown/30 shadow-frame relative group">
                       {sliderSettings && (
                         <UnifiedSlider 
                            images={area.dining_area_images?.length > 0 ? area.dining_area_images.map((img: any) => img.image_url) : [heroImgFallbackCurrent]} 
                            settings={sliderSettings}
                            className="w-full h-full"
                         />
                       )}
                       <div className="absolute top-6 left-6 z-20 px-4 py-1 bg-royal-deep/80 backdrop-blur-md border border-heritage-brown/40 text-heritage-orange font-display text-sm">
                          {String(idx + 1).padStart(2, '0')}
                       </div>
                    </div>
                    
                    <div className="w-full md:w-2/5 editorial-text">
                       <div className="font-serif-sc text-heritage-orange tracking-[0.4em] text-xs mb-6 uppercase">
                          {area.theme_type} · {area.tagline}
                       </div>
                       <h2 className="font-display text-5xl md:text-6xl text-foreground mb-8 leading-tight font-bold">
                          {area.title}
                       </h2>
                       <div className="w-12 h-px bg-heritage-orange mb-8" />
                       <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-6 italic">
                          {area.description}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* Section 2: Special Dishes Showcase */}
        <section className="relative py-20 md:py-32 px-4 md:px-6 bg-background border-y border-gold/20 overflow-hidden">
          <div className="absolute inset-0 lattice-pattern opacity-5" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24 editorial-text">
              <div className="font-serif-sc text-heritage-orange tracking-[0.4em] text-xs mb-4 uppercase font-bold">SIGNATURE CREATIONS</div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 font-bold">
                The Royal <span className="text-heritage-gradient italic">Menu</span>
              </h2>
              <div className="divider-heritage mt-6 max-w-xs mx-auto"><span className="text-heritage-orange text-sm">❖</span></div>
            </div>

            {dishesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-heritage-orange w-8 h-8" />
              </div>
            ) : dishesError ? (
              <div className="text-center py-12 max-w-xl mx-auto space-y-4">
                <div className="font-serif text-heritage-orange text-lg font-bold">Supabase Row Level Security (RLS) Policy Required</div>
                <p className="font-serif text-sm text-muted-foreground">
                  The dishes exist in the admin database but public visitors need read permission. Run the script <code className="bg-royal-deep text-heritage-orange px-2 py-1 rounded border border-heritage-brown/30">src/sql/dishes_rls.sql</code> in your Supabase SQL Editor.
                </p>
              </div>
            ) : dishes && dishes.length > 0 ? (
              <div className="dishes-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {dishes.map((dish) => (
                  <div key={dish.id} className="dish-card group relative">
                    <div className="aspect-square mb-6 overflow-hidden jharokha-frame border border-heritage-brown/30 shadow-md transition-transform duration-700 group-hover:scale-[1.02] bg-royal-deep/30">
                      {dish.image_url ? (
                        <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-heritage-brown/5">
                          <Utensils className="text-heritage-orange/50 w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-royal-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    <div className="text-center">
                      <div className="font-serif-sc text-heritage-orange text-[10px] tracking-widest mb-2 uppercase font-bold">{dish.category || "SIGNATURE"}</div>
                      <h3 className="font-display text-2xl text-foreground mb-3 font-bold">{dish.name}</h3>
                      {dish.description && (
                        <p className="font-serif text-muted-foreground/80 text-sm leading-relaxed mb-4 italic px-4 line-clamp-2">{dish.description}</p>
                      )}
                      <div className="font-serif text-heritage-orange tracking-widest text-lg font-semibold">{dish.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground font-serif italic">
                Our culinary team is crafting today's special menu. Please check back shortly.
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Celebrations & Special Events */}
        <section className="relative py-28 md:py-36 px-6 bg-gradient-night text-ivory overflow-hidden border-t border-gold/20">
          <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
          <div className="absolute inset-0 stone-texture opacity-30 pointer-events-none" />
          <DustParticles count={15} />

          <div className="relative max-w-7xl mx-auto z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <div className="eyebrow flex items-center justify-center gap-3 text-gold">
                <span>★ ROYAL BANQUETS & CELEBRATIONS ★</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory leading-tight font-bold">
                Special Events & <span className="italic text-gold-gradient">Royal Feasts</span>
              </h2>
              <div className="divider-gold max-w-md mx-auto"><span className="text-gold">❖</span></div>
              <p className="font-serif italic text-xl text-ivory/80 leading-relaxed">
                From private candlelit rooftop dining overlooking Mehrangarh Fort to royal family gatherings and wedding banquets beneath historic sandstone arches.
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsList.map((evt: any, idx: number) => {
                const images = evt.event_images || [];
                const hasMultipleImages = images.length > 1;

                return (
                  <div
                    key={evt.id || idx}
                    className="event-card bg-card/60 backdrop-blur-md border border-gold/30 shadow-frame hover:border-gold/60 transition-all duration-500 rounded-sm flex flex-col overflow-hidden group"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[16/10] bg-royal-deep overflow-hidden border-b border-gold/20">
                      {hasMultipleImages ? (
                        <UnifiedSlider
                          settings={sliderSettings || {
                            slide_speed: 5000,
                            transition_type: "fade",
                            autoplay: true,
                            pause_on_hover: true,
                            show_dots: true,
                            show_arrows: true,
                            loop: true,
                            animation_duration: 1000
                          }}
                          className="w-full h-full"
                          slides={images.map((img: any, i: number) => (
                            <div key={i} className="relative w-full h-full">
                              <img
                                src={img.image_url}
                                alt={img.alt_text || evt.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/80 via-transparent to-transparent pointer-events-none" />
                            </div>
                          ))}
                        />
                      ) : images.length === 1 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={images[0].image_url}
                            alt={images[0].alt_text || evt.title}
                            className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/80 via-transparent to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold/40 font-serif italic text-sm">
                          Event Dining
                        </div>
                      )}

                      {/* Category Pill */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="font-serif-sc text-[9px] tracking-widest text-gold bg-royal-deep/90 px-3 py-1 border border-gold/40 shadow-md uppercase">
                          {evt.category || "CELEBRATION"}
                        </span>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold/60 pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold/60 pointer-events-none" />
                    </div>

                    {/* Card Body */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-display text-2xl text-ivory font-bold leading-snug group-hover:text-gold transition-colors">
                          {evt.title}
                        </h3>

                        <p className="font-serif italic text-base text-gold-gradient leading-relaxed">
                          {evt.short_description}
                        </p>

                        {evt.full_description && (
                          <p className="font-serif text-sm text-ivory/70 line-clamp-3 leading-relaxed pt-1">
                            {evt.full_description}
                          </p>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-4 pt-4 border-t border-gold/15">
                        <div className="grid grid-cols-2 gap-3 text-xs font-serif text-ivory/80">
                          {evt.venue && (
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin size={14} className="text-gold shrink-0" />
                              <span className="truncate">{evt.venue}</span>
                            </div>
                          )}
                          {evt.capacity && (
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gold shrink-0" />
                              <span>{evt.capacity}</span>
                            </div>
                          )}
                          {evt.starting_price && (
                            <div className="flex items-center gap-2">
                              <IndianRupee size={14} className="text-gold shrink-0" />
                              <span>{evt.starting_price}</span>
                            </div>
                          )}
                          {evt.event_time && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gold shrink-0" />
                              <span>{evt.event_time}</span>
                            </div>
                          )}
                          {evt.event_date && (
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gold shrink-0" />
                              <span>{evt.event_date}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                          <Link
                            to={evt.cta_link || "/contact"}
                            className="w-full inline-flex items-center justify-center gap-2 font-serif-sc tracking-[0.25em] text-xs px-6 py-3.5 bg-gradient-gold text-royal-deep font-bold rounded-sm shadow-gold hover:scale-[1.02] transition-all duration-500 uppercase"
                          >
                            {evt.cta_text || "ENQUIRE FOR EVENT"} <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banquet Celebration Box */}
            <div className="relative max-w-4xl mx-auto mt-24 p-10 md:p-14 bg-card/80 border border-gold/40 shadow-gold text-center text-ivory overflow-hidden rounded-sm">
              <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="font-serif-sc text-gold tracking-[0.5em] text-xs font-bold flex items-center justify-center gap-2">
                  <HeartHandshake size={16} /> PLANNING A PRIVATE FEAST OR CELEBRATION?
                </div>
                <h3 className="font-display text-3xl md:text-5xl text-ivory font-bold">Host Your Banquet at Raj Mandir</h3>
                <div className="divider-gold max-w-md mx-auto"><span className="text-gold">❖</span></div>
                <p className="font-serif italic text-lg md:text-xl text-ivory/80 max-w-2xl mx-auto leading-relaxed">
                  From curated Marwari royal thali feasts on candlelit terraces to festive ceremonies with live folk musicians — let our palace culinary team craft your unforgettable banquet.
                </p>
                <div className="pt-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-3 font-serif-sc tracking-[0.3em] text-xs px-10 py-4 bg-gradient-gold text-royal-deep font-bold rounded-sm shadow-gold hover:scale-[1.03] transition-all duration-500 uppercase"
                  >
                    RESERVE FOR BANQUET <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Reservation CTA */}
        <section className="relative py-32 px-6 text-center overflow-hidden bg-background border-t border-gold/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-heritage-orange/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 editorial-text max-w-2xl mx-auto">
             <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8 font-bold">Ready for a Royal Feast?</h2>
             <p className="font-serif italic text-lg text-muted-foreground mb-10">Reserve your table to experience Jodhpur's finest heritage dining.</p>
             <a href="/contact" className="inline-block font-serif-sc tracking-[0.3em] text-xs px-10 py-5 bg-heritage-brown text-white rounded-sm hover:bg-heritage-orange transition-all duration-700 shadow-md font-bold uppercase">
                BOOK A TABLE
             </a>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Dining;
