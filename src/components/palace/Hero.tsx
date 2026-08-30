import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import heroImg from "@/assets/palace-hero.jpg";
import { DustParticles } from "./DustParticles";
import { useHomepageSections } from "@/lib/api";

export const Hero = ({ start }: { start: boolean }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const [cmsData, setCmsData] = useState({
    title: "Where Heritage Meets Hospitality",
    subtitle: "Experience warm hospitality and heritage architecture in the heart of Jodhpur's vibrant culture.",
    image_url: null as string | null,
    isVisible: true
  });

  const [sliderSettings, setSliderSettings] = useState<SliderSettings>({
    slide_speed: 6000,
    transition_type: "fade",
    autoplay: true,
    pause_on_hover: false,
    show_dots: false,
    show_arrows: false,
    loop: true,
    animation_duration: 1500
  });

  useEffect(() => {
    fetch('/rest/v1/slider_settings?section_name=eq.homepage', {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        setSliderSettings(prev => ({ ...prev, ...data[0] }));
      }
    })
    .catch(() => {});
  }, []);

  const { data: sections } = useHomepageSections();

  useEffect(() => {
    if (sections) {
      const heroSection = sections.find(s => s.section_key === "hero");
      if (heroSection) {
        setCmsData({
          title: heroSection.content?.title || "Where Heritage Meets Hospitality",
          subtitle: heroSection.content?.subtitle || "Experience warm hospitality and heritage architecture in the heart of Jodhpur's vibrant culture.",
          image_url: heroSection.content?.image_url || null,
          isVisible: heroSection.is_visible !== false
        });
      }
    }
  }, [sections]);

  useEffect(() => {
    if (!start || !cmsData.isVisible) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(imgRef.current, { scale: 1.1, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 1.8 })
      .fromTo(archRef.current, { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 1.2 }, "-=1.2")
      .fromTo(
        titleRef.current?.querySelectorAll(".reveal-char") || [],
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.04 },
        "-=0.6"
      )
      .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
      .fromTo(ctaRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");
  }, [start, cmsData.isVisible]);

  const title = cmsData.title;

  if (!cmsData.isVisible) return null;

  const currentHeroImage = cmsData.image_url || heroImg;

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-28 pb-20 bg-[#091a28]">
      {/* Hero background image container - single original hero image, NEVER disappears */}
      <div 
        ref={imgRef} 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage: `url(${currentHeroImage})` }}
      >
        {/* Clean dark overlay for text visibility without bottom background fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/40 pointer-events-none" />
      </div>

      <div className="opacity-30 pointer-events-none">
        <DustParticles count={20} />
      </div>

      {/* Central hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div
          ref={archRef}
          className="mx-auto mb-8 w-28 h-16 jharokha bg-gradient-gold opacity-95 shadow-lg relative"
        >
          <div className="absolute inset-[3px] jharokha bg-royal-deep" />
          <div className="absolute inset-0 jharokha animate-glow-pulse bg-gradient-gold opacity-30" />
        </div>

        <div className="font-serif-sc text-gold tracking-[0.5em] text-xs sm:text-sm mb-6 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          ★ HERITAGE GUEST HOUSE · JODHPUR ★
        </div>

        <h1
          ref={titleRef}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-white font-bold drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
        >
          <span className="inline-block overflow-hidden align-bottom pb-2">
            {title.split("").map((c, i) => (
              <span key={i} className="reveal-char inline-block">
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </span>
        </h1>

        <div className="divider-gold mt-6 max-w-md mx-auto opacity-90">
          <span className="font-display text-gold text-xl drop-shadow-md">❖</span>
        </div>

        <div ref={subRef} className="mt-6 font-serif italic text-lg md:text-2xl text-ivory/95 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-medium">
          {cmsData.subtitle}
        </div>

        <div ref={ctaRef} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="/booking"
            className="group relative px-10 py-4 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-xs sm:text-sm font-bold rounded-sm shadow-gold hover:scale-[1.02] transition-all duration-500"
          >
            PLAN YOUR STAY
          </a>
          <a
            href="/about"
            className="px-10 py-4 border-2 border-gold/70 text-white font-serif-sc tracking-[0.3em] text-xs sm:text-sm font-bold rounded-sm hover:bg-gold/20 hover:border-gold transition-all duration-500 bg-royal-deep/60 backdrop-blur-md shadow-md"
          >
            OUR STORY
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-gold font-serif-sc text-[10px] tracking-[0.5em] flex flex-col items-center gap-2 drop-shadow-md font-bold">
        SCROLL
        <div className="h-10 w-[2px] bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};
