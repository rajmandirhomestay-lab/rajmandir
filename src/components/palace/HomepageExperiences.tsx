import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import roomBg from "@/assets/gallery-4.jpg";
import { useExperiences, useSliderSettings } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Offers = () => {
  const ref = useRef<HTMLElement>(null);
  const { data: dbExperiences } = useExperiences();
  const { data: sliderSettings } = useSliderSettings('experiences');

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

  const displayExperiences = dbExperiences && dbExperiences.length > 0 
    ? dbExperiences.slice(0, 8) 
    : [];

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
    }, ref);
    return () => ctx.revert();
  }, [displayExperiences]);

  if (displayExperiences.length === 0) return null;

  return (
    <section ref={ref} id="experiences" className="relative py-32 px-6 overflow-hidden marble-texture">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.05),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] mb-4 uppercase">THE COLLECTION</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Curated <span className="text-gold-gradient italic">Experiences</span>
          </h2>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
          <p className="font-serif italic mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in the cultural tapestry of Jodhpur through curated royal experiences.
          </p>
        </div>

        <div className="experience-grid mt-12 px-4 md:px-12 relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-8">
              {displayExperiences.map((exp: any) => (
                <CarouselItem key={exp.id} className="pl-4 md:pl-8 sm:basis-1/2 md:basis-1/3">
                  <div className="experience-card group h-full flex flex-col">
                      <div className="aspect-[4/3] mb-6 overflow-hidden shadow-frame border border-gold/20 relative shrink-0">
                            <UnifiedSlider 
                              images={exp.experience_images?.length > 0 ? exp.experience_images.map((img: any) => img.image_url) : [roomBg]} 
                              settings={finalSliderSettings as unknown as SliderSettings}
                              className="w-full h-full"
                            />
                      </div>
                      <div className="space-y-4 flex-grow flex flex-col">
                          <div className="flex items-center gap-2 text-gold font-serif-sc text-[9px] md:text-[10px] tracking-widest uppercase">
                            <MapPin size={12} className="shrink-0" /> {exp.type || "ROYAL EXPERIENCE"}
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl text-foreground group-hover:text-gold transition-colors duration-500">{exp.title}</h3>
                          <div className="w-8 h-px bg-gold/30" />
                          <p className="font-serif text-sm md:text-base text-muted-foreground/80 leading-relaxed italic line-clamp-3 flex-grow">
                            {exp.description || exp.short_description || exp.full_description}
                          </p>
                          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-gold/10 mt-auto">
                            <Link to="/experiences" className="ml-auto font-serif-sc text-[9px] md:text-[10px] tracking-widest text-gold hover:text-white transition-colors">
                                DISCOVER MORE →
                            </Link>
                          </div>
                      </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayExperiences.length > 3 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-12 border-gold/30 hover:border-gold hover:bg-gold/10 text-gold" />
                <CarouselNext className="hidden md:flex -right-12 border-gold/30 hover:border-gold hover:bg-gold/10 text-gold" />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

