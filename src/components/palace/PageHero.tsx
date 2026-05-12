import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DustParticles } from "./DustParticles";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  accent?: string; // gold-italic word(s)
  subtitle: string;
  image: string;
  alt: string;
}

export const PageHero = ({ eyebrow, title, accent, subtitle, image, alt }: PageHeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(imgRef.current, { scale: 1.18, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.2 })
        .fromTo(".ph-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, "-=1.4")
        .fromTo(".ph-arch", { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 1.2 }, "-=0.9")
        .fromTo(".ph-title > *", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.05 }, "-=0.7")
        .fromTo(".ph-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, "-=0.5");

      gsap.to(imgRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative min-h-[92vh] w-full overflow-hidden flex items-center justify-center pt-32 pb-20">
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <img src={image} alt={alt} className="h-full w-full object-cover" width={1920} height={1280} />
        <div className="absolute inset-0 bg-gradient-to-b from-royal-deep/70 via-royal-deep/40 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,hsl(var(--royal-deep)/0.85))]" />
      </div>

      <div className="absolute inset-0 light-rays opacity-60" aria-hidden />
      <DustParticles count={28} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="ph-arch mx-auto mb-8 w-24 h-14 jharokha bg-gradient-gold opacity-90 shadow-gold relative">
          <div className="absolute inset-[3px] jharokha bg-royal-deep" />
        </div>
        <div className="ph-eyebrow eyebrow mb-6">★ {eyebrow} ★</div>
        <h1 className="ph-title font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-ivory drop-shadow-[0_10px_30px_hsl(var(--royal-deep)/0.9)]">
          <span className="inline-block overflow-hidden align-bottom">
            {title.split("").map((c, i) => (
              <span key={`t${i}`} className="inline-block">{c === " " ? "\u00A0" : c}</span>
            ))}
          </span>
          {accent && (
            <>
              <br />
              <span className="inline-block overflow-hidden align-bottom italic text-gold-gradient">
                {accent.split("").map((c, i) => (
                  <span key={`a${i}`} className="inline-block">{c === " " ? "\u00A0" : c}</span>
                ))}
              </span>
            </>
          )}
        </h1>
        <div className="divider-gold mt-8 max-w-md mx-auto">
          <span className="font-display text-gold text-xl">❖</span>
        </div>
        <p className="ph-sub mt-6 font-serif italic text-lg md:text-2xl text-ivory max-w-2xl mx-auto leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] font-medium">
          {subtitle}
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gold/90 font-serif-sc text-[10px] tracking-[0.5em] flex flex-col items-center gap-3 drop-shadow-md font-bold">
        CONTINUE
        <div className="h-12 w-px bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};
