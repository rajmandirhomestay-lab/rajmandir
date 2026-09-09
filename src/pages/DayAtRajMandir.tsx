import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { useDayAtRajMandir, useEvents, usePageHero } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";
import { Coffee, Utensils, Compass, Moon, Sun, Sparkles, Clock, ChevronRight, Calendar, MapPin, Users, IndianRupee, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import heroFallbackImg from "@/assets/palace-hero.jpg";
import morningImg from "@/assets/gallery-3.jpg";
import breakfastImg from "@/assets/dining-thali.jpg";
import exploreImg from "@/assets/exp-cultural.jpg";
import lunchImg from "@/assets/dining-rooftop.jpg";
import relaxImg from "@/assets/room-haveli.jpg";
import sunsetImg from "@/assets/story-bluecity.jpg";
import rooftopImg from "@/assets/gallery-4.jpg";
import dinnerImg from "@/assets/about-palace.jpg";

import eventWeddingImg from "@/assets/exp-cultural.jpg";
import eventBirthdayImg from "@/assets/gallery-1.jpg";
import eventDinnerImg from "@/assets/dining-rooftop.jpg";
import eventFolkImg from "@/assets/gallery-4.jpg";

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, any> = {
  Coffee, Utensils, Compass, Moon, Sun, Sparkles, Clock
};

const initialFallbackActivities = [
  {
    id: "f1",
    time: "07:30 AM",
    title: "Wake Up & Morning Tea",
    category: "Morning",
    short_description: "Start the day slowly with a warm cup of tea and peaceful views around Raj Mandir.",
    full_description: "As dawn gently lights up the desert sky, enjoy a freshly brewed cup of traditional masala chai or herbal tea on your balcony or in our quiet courtyard.",
    icon: "Coffee",
    sort_order: 1,
    active: true,
    day_at_raj_mandir_images: [{ id: "img1", image_url: morningImg, alt_text: "Morning Tea at Raj Mandir" }]
  },
  {
    id: "f2",
    time: "09:00 AM",
    title: "Traditional Breakfast",
    category: "Morning",
    short_description: "Enjoy a fresh breakfast before beginning your Jodhpur adventure.",
    full_description: "Relish a lavish spread featuring authentic Rajasthani breakfast specialties alongside continental favorites, freshly squeezed juices, and local fruits.",
    icon: "Utensils",
    sort_order: 2,
    active: true,
    day_at_raj_mandir_images: [{ id: "img2", image_url: breakfastImg, alt_text: "Traditional Rajasthani Breakfast" }]
  },
  {
    id: "f3",
    time: "10:30 AM",
    title: "Explore Jodhpur",
    category: "Afternoon",
    short_description: "Head out to discover the heritage, culture, streets, and landmarks surrounding the hotel.",
    full_description: "Step right outside into the historic blue lanes of Navchokiya, or take a short 4-minute walk to Mehrangarh Fort and Jaswant Thada with our walking guide.",
    icon: "Compass",
    sort_order: 3,
    active: true,
    day_at_raj_mandir_images: [{ id: "img3", image_url: exploreImg, alt_text: "Exploring Jodhpur Streets" }]
  },
  {
    id: "f4",
    time: "01:30 PM",
    title: "A Taste of Rajasthan",
    category: "Afternoon",
    short_description: "Return to Raj Mandir and enjoy traditional flavours and a relaxed afternoon.",
    full_description: "Savor a royal Marwari thali or light afternoon refreshments prepared by our heritage culinary team using secret family recipes passed down over generations.",
    icon: "Utensils",
    sort_order: 4,
    active: true,
    day_at_raj_mandir_images: [{ id: "img4", image_url: lunchImg, alt_text: "Rooftop Lunch Experience" }]
  },
  {
    id: "f5",
    time: "03:00 PM",
    title: "Slow Afternoon",
    category: "Afternoon",
    short_description: "Take some time to rest in the comfort of your room or enjoy the peaceful atmosphere of the property.",
    full_description: "Unwind under carved stone arches, read a book in the shaded courtyards, or rest inside your air-conditioned royal chamber.",
    icon: "Moon",
    sort_order: 5,
    active: true,
    day_at_raj_mandir_images: [{ id: "img5", image_url: relaxImg, alt_text: "Relaxing in Palace Chamber" }]
  },
  {
    id: "f6",
    time: "05:30 PM",
    title: "Golden Hour",
    category: "Evening",
    short_description: "Watch the evening light transform the Blue City while enjoying the rooftop atmosphere.",
    full_description: "Gather on our sunset deck as the sun dips below Mehrangarh Fort, casting a magical golden aura across the blue rooftops of Jodhpur.",
    icon: "Sun",
    sort_order: 6,
    active: true,
    day_at_raj_mandir_images: [{ id: "img6", image_url: sunsetImg, alt_text: "Sunset over Mehrangarh Fort" }]
  },
  {
    id: "f7",
    time: "07:30 PM",
    title: "Rooftop Evening",
    category: "Evening",
    short_description: "Spend the evening enjoying the ambience, conversations, and views from Raj Mandir.",
    full_description: "Listen to soft traditional folk music under the stars as lanterns illuminate the rooftop terrace and cold desert breezes roll in.",
    icon: "Sparkles",
    sort_order: 7,
    active: true,
    day_at_raj_mandir_images: [{ id: "img7", image_url: rooftopImg, alt_text: "Lantern lit Rooftop Evening" }]
  },
  {
    id: "f8",
    time: "09:00 PM",
    title: "Traditional Dinner",
    category: "Night",
    short_description: "End the day with authentic flavours and a warm Rajasthani hospitality experience.",
    full_description: "Dine in candlelit splendor on curated dishes, fine drinks, and sweet delicacies under the open Jodhpur night sky.",
    icon: "Utensils",
    sort_order: 8,
    active: true,
    day_at_raj_mandir_images: [{ id: "img8", image_url: dinnerImg, alt_text: "Candlelit Traditional Dinner" }]
  }
];

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

export const DayAtRajMandir = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const { data: pageHero } = usePageHero("day-at-raj-mandir");
  const { data: dbActivities } = useDayAtRajMandir();
  const { data: dbEvents } = useEvents();

  const activities = (dbActivities && dbActivities.length > 0) 
    ? dbActivities.filter(a => a.active !== false) 
    : initialFallbackActivities;

  const eventsList = (dbEvents && dbEvents.length > 0)
    ? dbEvents.filter(e => e.active !== false)
    : initialFallbackEvents;

  const sliderSettings: SliderSettings = {
    slide_speed: 5000,
    transition_type: "fade",
    autoplay: true,
    pause_on_hover: true,
    show_dots: true,
    show_arrows: true,
    loop: true,
    animation_duration: 1000
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Timeline scroll reveals
      gsap.utils.toArray(".timeline-block").forEach((block: any) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
            },
          }
        );
      });

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

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }, containerRef);

    return () => ctx.revert();
  }, [activities, eventsList]);

  return (
    <PageShell
      title="A Day at Raj Mandir — Heritage Palace Experience & Events Jodhpur"
      description="Discover how a complete day unfolds at Raj Mandir Hotel and explore our luxury heritage event spaces for weddings, private dinners, and celebrations."
    >
      {/* PAGE HERO */}
      <PageHero
        eyebrow={pageHero?.eyebrow || "A DAY AT RAJ MANDIR"}
        title={pageHero?.title || "A Day at"}
        accent={pageHero?.accent || "Raj Mandir"}
        subtitle={pageHero?.subtitle || "From a peaceful morning to an unforgettable evening."}
        image={pageHero?.image_url || heroFallbackImg}
        alt="A Day at Raj Mandir Hotel"
      />

      <div ref={containerRef} className="relative">
        {/* TIMELINE EXPERIENCE CONTAINER */}
        <section className="relative py-24 md:py-36 px-6 bg-background overflow-hidden">
        <div className="absolute inset-0 marble-texture pointer-events-none opacity-40" />
        <DustParticles count={25} />

        {/* Central Vertical Connecting Line (Desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-44 bottom-32 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent hidden lg:block" />

        <div className="relative max-w-7xl mx-auto space-y-24 md:space-y-36">
          
          {activities.map((act, index) => {
            const isReverse = index % 2 === 1;
            const IconComponent = ICON_MAP[act.icon] || Clock;
            const images = act.day_at_raj_mandir_images || [];
            const hasMultipleImages = images.length > 1;

            return (
              <div
                key={act.id || index}
                className={cn(
                  "timeline-block relative grid lg:grid-cols-12 gap-8 lg:gap-16 items-center",
                  isReverse ? "" : ""
                )}
              >
                {/* Timeline Center Node Badge (Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center justify-center z-20">
                  <div className="w-12 h-12 rounded-full bg-royal-deep border-2 border-gold flex items-center justify-center text-gold shadow-gold">
                    <IconComponent size={20} />
                  </div>
                  <span className="font-serif-sc text-[9px] tracking-widest text-gold bg-royal-deep/90 px-2 py-0.5 border border-gold/30 rounded-sm mt-2 whitespace-nowrap shadow-md">
                    {act.time}
                  </span>
                </div>

                {/* IMAGE COLUMN */}
                <div
                  className={cn(
                    "lg:col-span-6 relative aspect-[16/10] sm:aspect-[4/3] rounded-sm overflow-hidden shadow-frame border border-gold/30 group",
                    isReverse ? "lg:order-2" : "lg:order-1"
                  )}
                >
                  {hasMultipleImages ? (
                    <UnifiedSlider
                      settings={sliderSettings}
                      className="w-full h-full"
                      slides={images.map((img: any, i: number) => (
                        <div key={i} className="relative w-full h-full">
                          <img
                            src={img.image_url}
                            alt={img.alt_text || act.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                      ))}
                    />
                  ) : images.length === 1 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={images[0].image_url}
                        alt={images[0].alt_text || act.title}
                        className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-royal-deep/50 flex items-center justify-center text-gold/50 font-serif italic text-sm">
                      Palace Photography
                    </div>
                  )}

                  {/* Corner Ornaments */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-gold/60 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold/60 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-gold/60 pointer-events-none" />
                </div>

                {/* TEXT COLUMN */}
                <div
                  className={cn(
                    "lg:col-span-6 space-y-5",
                    isReverse ? "lg:order-1 lg:text-right" : "lg:order-2 lg:text-left"
                  )}
                >
                  {/* Mobile Badge */}
                  <div className={cn("flex items-center gap-3 lg:hidden", isReverse ? "justify-end" : "justify-start")}>
                    <span className="w-8 h-8 rounded-full bg-royal-deep border border-gold flex items-center justify-center text-gold">
                      <IconComponent size={14} />
                    </span>
                    <span className="font-serif-sc text-xs tracking-widest text-gold bg-gold/10 px-3 py-1 border border-gold/30">
                      {act.time}
                    </span>
                  </div>

                  <div className={cn("eyebrow flex items-center gap-2", isReverse ? "lg:justify-end" : "lg:justify-start")}>
                    <span>★ {act.category ? act.category.toUpperCase() : "PALACE ACTIVITY"} ★</span>
                  </div>

                  <h3 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-tight">
                    {act.title}
                  </h3>

                  <div className={cn("divider-gold max-w-xs", isReverse ? "lg:ml-auto lg:mr-0" : "lg:mr-auto lg:ml-0")}>
                    <span className="text-gold text-lg">❖</span>
                  </div>

                  <p className="font-serif italic text-xl text-gold-gradient font-medium leading-relaxed">
                    {act.short_description}
                  </p>

                  {act.full_description && (
                    <p className="font-serif text-lg leading-relaxed text-muted-foreground pt-2">
                      {act.full_description}
                    </p>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* ========================================================= */}
      {/* NEW SECTION: EVENTS AT RAJ MANDIR                         */}
      {/* ========================================================= */}
      <section ref={eventsRef} className="relative py-28 md:py-36 px-6 bg-gradient-night text-ivory overflow-hidden border-t border-gold/20">
        <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
        <div className="absolute inset-0 stone-texture opacity-30 pointer-events-none" />
        <DustParticles count={20} />

        <div className="relative max-w-7xl mx-auto">
          {/* SECTION HEADER */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="eyebrow flex items-center justify-center gap-3 text-gold">
              <span>★ CELEBRATIONS & GATHERINGS ★</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory leading-tight font-bold">
              Events at <span className="italic text-gold-gradient">Raj Mandir</span>
            </h2>
            <div className="divider-gold max-w-md mx-auto"><span className="text-gold">❖</span></div>
            <p className="font-serif italic text-xl text-ivory/80 leading-relaxed">
              From intimate heritage weddings beneath stone arches to private candlelit rooftop feasts — forge timeless memories in Jodhpur.
            </p>
          </div>

          {/* EVENTS GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsList.map((evt, idx) => {
              const images = evt.event_images || [];
              const hasMultipleImages = images.length > 1;

              return (
                <div
                  key={evt.id || idx}
                  className="event-card bg-card/60 backdrop-blur-md border border-gold/30 shadow-frame hover:border-gold/60 transition-all duration-500 rounded-sm flex flex-col overflow-hidden group"
                >
                  {/* SLIDER / IMAGE CONTAINER */}
                  <div className="relative aspect-[16/10] bg-royal-deep overflow-hidden border-b border-gold/20">
                    {hasMultipleImages ? (
                      <UnifiedSlider
                        settings={sliderSettings}
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
                        Event Photography
                      </div>
                    )}

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="font-serif-sc text-[9px] tracking-widest text-gold bg-royal-deep/90 px-3 py-1 border border-gold/40 shadow-md uppercase">
                        {evt.category || "CELEBRATION"}
                      </span>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold/60 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold/60 pointer-events-none" />
                  </div>

                  {/* CARD BODY */}
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

                    {/* DETAILS GRID */}
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

                      {/* CTA BUTTON */}
                      <div className="pt-2">
                        <Link
                          to={evt.cta_link || "/contact"}
                          className="w-full inline-flex items-center justify-center gap-2 font-serif-sc tracking-[0.25em] text-xs px-6 py-3.5 bg-gradient-gold text-royal-deep font-bold rounded-sm shadow-gold hover:scale-[1.02] transition-all duration-500"
                        >
                          {evt.cta_text || "ENQUIRE NOW"} <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PLANNING A CELEBRATION CTA */}
          <div className="relative max-w-4xl mx-auto mt-28 p-10 md:p-16 bg-card/80 border border-gold/40 shadow-gold text-center text-ivory overflow-hidden rounded-sm">
            <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="font-serif-sc text-gold tracking-[0.5em] text-xs font-bold flex items-center justify-center gap-2">
                <HeartHandshake size={16} /> PLANNING A CELEBRATION?
              </div>
              <h3 className="font-display text-4xl md:text-5xl text-ivory">Host Your Event at Raj Mandir</h3>
              <div className="divider-gold max-w-md mx-auto"><span className="text-gold">❖</span></div>
              <p className="font-serif italic text-xl text-ivory/80 max-w-2xl mx-auto leading-relaxed">
                From grand heritage weddings to intimate family feasts — our courtyards, terraces, and royal hospitality team await your special occasions.
              </p>
              <div className="pt-6">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 font-serif-sc tracking-[0.3em] text-xs px-10 py-5 bg-gradient-gold text-royal-deep font-bold rounded-sm shadow-gold hover:scale-[1.03] transition-all duration-700"
                >
                  ENQUIRE ABOUT EVENTS <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
      </div>
    </PageShell>
  );
};

export default DayAtRajMandir;

