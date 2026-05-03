import { useEffect, useRef } from "react";
import gsap from "gsap";
import heroImg from "@/assets/palace-hero.jpg";
import { DustParticles } from "./DustParticles";

export const Hero = ({ start }: { start: boolean }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!start) return;
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
  }, [start]);

  const title = "Raj Mandir";

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16">
      {/* Background image with parallax-like scale */}
      <div ref={imgRef} className="absolute inset-0">
        <img
          src={heroImg}
          alt="Raj Mandir Guest House palace courtyard at golden hour"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-royal-deep/40 via-background/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--royal-deep)/0.7))]" />
      </div>

      <DustParticles count={40} />

      {/* Central jharokha arch */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div
          ref={archRef}
          className="mx-auto mb-10 w-32 h-20 jharokha bg-gradient-gold opacity-90 shadow-gold relative"
        >
          <div className="absolute inset-[3px] jharokha bg-royal-deep" />
          <div className="absolute inset-0 jharokha animate-glow-pulse bg-gradient-gold opacity-50" />
        </div>

        <div className="font-serif-sc text-gold tracking-[0.6em] text-xs md:text-sm mb-8">
          ★ HERITAGE GUEST HOUSE · JODHPUR ★
        </div>

        <h1
          ref={titleRef}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-ivory drop-shadow-[0_4px_30px_hsl(var(--royal-deep)/0.8)]"
        >
          <span className="inline-block overflow-hidden align-bottom">
            {title.split("").map((c, i) => (
              <span key={i} className="reveal-char inline-block">
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </span>
        </h1>

        <div className="divider-gold mt-8 max-w-md mx-auto">
          <span className="font-display text-gold text-xl">❖</span>
        </div>

        <div ref={subRef} className="mt-6 font-serif italic text-lg md:text-2xl text-ivory/90 max-w-2xl mx-auto leading-relaxed">
          Where the blue city sleeps beneath sandstone arches, and every doorway
          opens onto a forgotten dynasty.
        </div>

        <div ref={ctaRef} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="#rooms"
            className="group relative px-10 py-4 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm rounded-sm shadow-gold hover:scale-[1.02] transition-all duration-700"
          >
            ENTER THE PALACE
          </a>
          <a
            href="#about"
            className="px-10 py-4 border border-gold/60 text-ivory font-serif-sc tracking-[0.3em] text-sm rounded-sm hover:bg-gold/10 hover:border-gold transition-all duration-700"
          >
            OUR STORY
          </a>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gold/70 font-serif-sc text-[10px] tracking-[0.5em] flex flex-col items-center gap-3">
        SCROLL
        <div className="h-12 w-px bg-gradient-to-b from-gold/70 to-transparent animate-pulse" />
      </div>
    </section>
  );
};
