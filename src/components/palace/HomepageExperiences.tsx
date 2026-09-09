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
    <section ref={ref} id="experiences" className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-[#082438] via-[#0b334d] to-[#071f30] text-white border-b border-[#0284c7]/30">
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center mb-24">
          <div className="font-serif-sc text-[#38bdf8] tracking-[0.4em] text-xs mb-4 uppercase font-bold drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">THE COLLECTION</div>
          <h2 className="font-display text-5xl md:text-6xl text-white font-bold">
            Curated <span className="text-[#38bdf8] italic">Experiences</span>
          </h2>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-[#38bdf8] text-sm">❖</span></div>
          <p className="font-serif italic mt-6 text-lg md:text-xl text-sky-100/90 max-w-2xl mx-auto font-medium">
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
                  <div className="experience-card group h-full flex flex-col bg-[#061e30]/95 backdrop-blur-md p-4 rounded-sm border border-[#0284c7]/40 hover:border-[#38bdf8] transition-all duration-500 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                      <div className="aspect-[4/3] mb-6 overflow-hidden shadow-frame border border-[#0284c7]/40 relative shrink-0">
                            <UnifiedSlider 
                              images={exp.experience_images?.length > 0 ? exp.experience_images.map((img: any) => img.image_url) : [roomBg]} 
                              settings={finalSliderSettings as unknown as SliderSettings}
                              className="w-full h-full"
                            />
                      </div>
                      <div className="space-y-4 flex-grow flex flex-col px-2 pb-2">
                          <div className="flex items-center gap-2 text-[#38bdf8] font-serif-sc text-[9px] md:text-[10px] tracking-widest uppercase font-bold">
                            <MapPin size={12} className="shrink-0 text-[#38bdf8]" /> {exp.type || "ROYAL EXPERIENCE"}
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl text-white group-hover:text-[#38bdf8] transition-colors duration-500 font-bold">{exp.title}</h3>
                          <div className="w-8 h-px bg-[#38bdf8]/40" />
                          <p className="font-serif text-sm md:text-base text-sky-100/80 leading-relaxed italic line-clamp-3 flex-grow font-medium">
                            {exp.description || exp.short_description || exp.full_description}
                          </p>
                          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-[#0284c7]/30 mt-auto">
                            <Link to="/experiences" className="ml-auto font-serif-sc text-[9px] md:text-[10px] tracking-widest text-[#38bdf8] hover:text-white transition-colors font-bold">
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
                <CarouselPrevious className="hidden md:flex -left-12 border-[#0284c7]/60 hover:border-[#38bdf8] hover:bg-[#0284c7]/20 text-[#38bdf8]" />
                <CarouselNext className="hidden md:flex -right-12 border-[#0284c7]/60 hover:border-[#38bdf8] hover:bg-[#0284c7]/20 text-[#38bdf8]" />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};
