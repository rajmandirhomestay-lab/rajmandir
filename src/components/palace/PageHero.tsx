import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageHeroProps {
  eyebrow?: string;
  title?: string;
  accent?: string;
  subtitle?: string;
  image?: string;
  alt?: string;
}

export const PageHero = ({
  eyebrow = "THE PALACE",
  title = "Raj Mandir",
  accent = "",
  subtitle = "",
  image = "",
  alt = "Raj Mandir"
}: PageHeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(imgRef.current, { scale: 1.1, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 1.8 })
        .fromTo(".ph-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 }, "-=1.2")
        .fromTo(".ph-arch", { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 1.0 }, "-=0.8")
        .fromTo(".ph-title > *", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.04 }, "-=0.6")
        .fromTo(".ph-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

      gsap.to(imgRef.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const safeTitle = (title && typeof title === "string" && title.trim().length > 0) ? title.trim() : "Raj Mandir";
  const safeAccent = (accent && typeof accent === "string" && accent.trim().length > 0) ? accent.trim() : "";
  const safeEyebrow = (eyebrow && typeof eyebrow === "string" && eyebrow.trim().length > 0) ? eyebrow.trim() : "THE PALACE";
  const safeSubtitle = (subtitle && typeof subtitle === "string") ? subtitle.trim() : "";

  const displayTitle = (safeAccent && safeTitle.toLowerCase().endsWith(safeAccent.toLowerCase()))
    ? safeTitle.slice(0, safeTitle.length - safeAccent.length).trim()
    : safeTitle;

  const titleWords = (displayTitle || safeTitle).split(" ").filter(Boolean);
  const accentWords = safeAccent ? safeAccent.split(" ").filter(Boolean) : [];

  return (
    <section ref={ref} className="relative min-h-[70vh] lg:min-h-[80vh] w-full overflow-hidden flex items-center justify-center pt-32 pb-20">
      {/* Background Image Container */}
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        {image ? (
          <img src={image} alt={alt || safeTitle} className="h-full w-full object-cover filter brightness-[0.9] contrast-[1.05]" width={1920} height={1280} />
        ) : (
          <div className="h-full w-full bg-royal-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/40 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="ph-arch mx-auto mb-8 w-24 h-14 jharokha bg-gradient-gold opacity-90 shadow-gold relative">
          <div className="absolute inset-[3px] jharokha bg-royal-deep" />
        </div>
        <div className="ph-eyebrow font-serif-sc text-gold tracking-[0.5em] text-xs sm:text-sm mb-6 font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          ★ {safeEyebrow} ★
        </div>
        <h1 className="ph-title font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-white font-bold drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
          <span className="inline-block overflow-hidden align-bottom">
            {titleWords.map((word, wordIndex) => (
              <span key={`w${wordIndex}`} className="inline-block whitespace-nowrap">
                {word.split("").map((c, i) => (
                  <span key={`t${i}`} className="inline-block">{c}</span>
                ))}
                {wordIndex < titleWords.length - 1 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
          </span>
          {accentWords.length > 0 && (
            <>
              <br />
              <span className="inline-block overflow-hidden align-bottom italic text-gold-gradient">
                {accentWords.map((word, wordIndex) => (
                  <span key={`aw${wordIndex}`} className="inline-block whitespace-nowrap">
                    {word.split("").map((c, i) => (
                      <span key={`a${i}`} className="inline-block">{c}</span>
                    ))}
                    {wordIndex < accentWords.length - 1 && <span className="inline-block">&nbsp;</span>}
                  </span>
                ))}
              </span>
            </>
          )}
        </h1>
        {safeSubtitle && (
          <>
            <div className="divider-gold mt-8 max-w-md mx-auto">
              <span className="font-display text-gold text-xl drop-shadow">❖</span>
            </div>
            <p className="ph-sub mt-6 font-serif italic text-xl md:text-3xl text-ivory max-w-3xl mx-auto leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] font-semibold">
              {safeSubtitle}
            </p>
          </>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gold font-serif-sc text-[10px] tracking-[0.5em] flex flex-col items-center gap-3 drop-shadow-md font-bold">
        EXPLORE
        <div className="h-12 w-px bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};
