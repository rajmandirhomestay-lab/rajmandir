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
    title: "Raj Mandir",
    subtitle: "Where the blue city sleeps beneath sandstone arches, and every doorway opens onto a forgotten dynasty.",
    image_url: null as string | null,
    isVisible: true
  });

  const { data: sections } = useHomepageSections();

  useEffect(() => {
    if (sections) {
      const heroSection = sections.find(s => s.section_key === "hero");
      if (heroSection) {
        setCmsData({
          title: heroSection.content?.title || "Raj Mandir",
          subtitle: heroSection.content?.subtitle || "Where the blue city sleeps beneath sandstone arches, and every doorway opens onto a forgotten dynasty.",
          image_url: heroSection.content?.image_url || null,
          isVisible: heroSection.is_visible !== false
        });
      }
    }
  }, [sections]);

  useEffect(() => {
    if (!start || !cmsData.isVisible) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(imgRef.current, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4 })
      .fromTo(archRef.current, { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 1.4 }, "-=1.6")
      .fromTo(
        titleRef.current?.querySelectorAll(".reveal-char") || [],
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.05 },
        "-=0.8"
      )
      .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, "-=0.4")
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.4");
  }, [start, cmsData.isVisible]);

  const title = cmsData.title;

  if (!cmsData.isVisible) return null;

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16">
      {/* Background image with refined cinematic dark overlay */}
      <div ref={imgRef} className="absolute inset-0">
        <img
          src={cmsData.image_url || heroImg}
          alt="Raj Mandir Guest House palace courtyard at golden hour"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Balanced dark gradient to ensure text readability without excessive haze */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-royal-deep/50 to-background/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Reduced dust particle opacity to avoid white fog effect over text */}
      <div className="opacity-60">
        <DustParticles count={30} />
      </div>

      {/* Central jharokha arch with reduced glow */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div
          ref={archRef}
          className="mx-auto mb-10 w-32 h-20 jharokha bg-gradient-gold opacity-90 shadow-lg relative"
        >
          <div className="absolute inset-[3px] jharokha bg-royal-deep" />
          <div className="absolute inset-0 jharokha animate-glow-pulse bg-gradient-gold opacity-20" />
        </div>

        <div className="font-serif-sc text-gold tracking-[0.6em] text-xs md:text-sm mb-8 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          ★ HERITAGE GUEST HOUSE · JODHPUR ★
        </div>

        <h1
          ref={titleRef}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-white font-bold drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)]"
        >
          <span className="inline-block overflow-hidden align-bottom pb-2">
            {title.split("").map((c, i) => (
              <span key={i} className="reveal-char inline-block">
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </span>
        </h1>

        <div className="divider-gold mt-6 max-w-md mx-auto opacity-80">
          <span className="font-display text-gold text-xl drop-shadow-md">❖</span>
        </div>

        <div ref={subRef} className="mt-8 font-serif italic text-xl md:text-3xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] font-semibold">
          {cmsData.subtitle}
        </div>

        <div ref={ctaRef} className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="#rooms"
            className="group relative px-10 py-4 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm font-bold rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all duration-700"
          >
            ENTER THE PALACE
          </a>
          <a
            href="#about"
            className="px-10 py-4 border-2 border-gold/60 text-white font-serif-sc tracking-[0.3em] text-sm font-bold rounded-sm hover:bg-gold/15 hover:border-gold transition-all duration-700 bg-black/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            OUR STORY
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gold/90 font-serif-sc text-[10px] tracking-[0.5em] flex flex-col items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">
        SCROLL
        <div className="h-12 w-[2px] bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};
