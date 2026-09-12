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
    <section ref={ref} id="experiences" className="relative py-32 px-6 overflow-hidden bg-[#faf6f0] text-[#091a28] border-b border-[#e5dac9]">
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-24">
          <div className="font-serif-sc text-[#b45309] tracking-[0.4em] text-xs mb-4 uppercase font-bold">THE COLLECTION</div>
          <h2 className="font-display text-5xl md:text-6xl text-[#091a28] font-bold">
            Curated <span className="text-[#145992] italic">Experiences</span>
          </h2>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-[#b45309] text-sm">❖</span></div>
          <p className="font-serif italic mt-6 text-lg md:text-xl text-[#2c4d6f] max-w-2xl mx-auto font-medium">
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
                  <div className="experience-card group h-full flex flex-col bg-white/95 backdrop-blur-md p-4 rounded-sm border border-[#e5dac9] hover:border-[#145992] transition-all duration-500 shadow-md hover:shadow-xl">
                      <div className="aspect-[4/3] mb-6 overflow-hidden shadow-frame border border-[#e5dac9] relative shrink-0">
                            <UnifiedSlider 
                              images={exp.experience_images?.length > 0 ? exp.experience_images.map((img: any) => img.image_url) : [roomBg]} 
                              settings={finalSliderSettings as unknown as SliderSettings}
                              className="w-full h-full"
                            />
                      </div>
                      <div className="space-y-4 flex-grow flex flex-col px-2 pb-2">
                          <div className="flex items-center gap-2 text-[#145992] font-serif-sc text-[9px] md:text-[10px] tracking-widest uppercase font-bold">
                            <MapPin size={12} className="shrink-0 text-[#145992]" /> {exp.type || "ROYAL EXPERIENCE"}
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl text-[#091a28] group-hover:text-[#145992] transition-colors duration-500 font-bold">{exp.title}</h3>
                          <div className="w-8 h-px bg-[#145992]/30" />
                          <p className="font-serif text-sm md:text-base text-[#2c4d6f] leading-relaxed italic line-clamp-3 flex-grow font-medium">
                            {exp.description || exp.short_description || exp.full_description}
                          </p>
                          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-[#e5dac9] mt-auto">
                            <Link to="/experiences" className="ml-auto font-serif-sc text-[9px] md:text-[10px] tracking-widest text-[#145992] hover:text-[#091a28] transition-colors font-bold">
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
                <CarouselPrevious className="hidden md:flex -left-12 border-gold/40 hover:border-gold hover:bg-gold/10 text-gold" />
                <CarouselNext className="hidden md:flex -right-12 border-gold/40 hover:border-gold hover:bg-gold/10 text-gold" />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};
