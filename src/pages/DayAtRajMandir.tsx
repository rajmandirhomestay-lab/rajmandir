import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { useDayAtRajMandir, usePageHero } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";
import { Coffee, Utensils, Compass, Moon, Sun, Sparkles, Clock } from "lucide-react";
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

export const DayAtRajMandir = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: pageHero } = usePageHero("day-at-raj-mandir");
  const { data: dbActivities } = useDayAtRajMandir();

  const activities = (dbActivities && dbActivities.length > 0) 
    ? dbActivities.filter(a => a.active !== false) 
    : initialFallbackActivities;

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

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }, containerRef);

    return () => ctx.revert();
  }, [activities]);

  return (
    <PageShell
      title="A Day at Raj Mandir — Heritage Palace Experience Jodhpur"
      description="Discover how a complete day unfolds at Raj Mandir Hotel from a peaceful morning chai to dinner beneath the starry Jodhpur sky."
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
      </div>
    </PageShell>
  );
};

export default DayAtRajMandir;

