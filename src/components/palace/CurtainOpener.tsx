import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/api";

export const CurtainOpener = ({ onComplete }: { onComplete?: () => void }) => {
  const { data: settings } = useSettings();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // If curtain is explicitly disabled in CMS settings, skip it
    if (settings && settings.curtain_enabled === false) {
      setDone(true);
      onComplete?.();
      return;
    }

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      setDone(true);
      onComplete?.();
    };

    const tl = gsap.timeline({
      onComplete: finish,
    });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
      .to(titleRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.3")
      .to(
        leftRef.current,
        { xPercent: -102, duration: 1.2, ease: "power4.inOut" },
        "-=0.15"
      )
      .to(
        rightRef.current,
        { xPercent: 102, duration: 1.2, ease: "power4.inOut" },
        "<"
      )
      .to(wrapRef.current, { autoAlpha: 0, duration: 0.2, pointerEvents: "none" }, "-=0.2");

    // Safety fallback so curtain guaranteed completes within 2.5s max
    const timer = setTimeout(finish, 2500);

    return () => {
      clearTimeout(timer);
      tl.kill();
    };
  }, [onComplete, settings?.curtain_enabled]);

  if (done || settings?.curtain_enabled === false) return null;

  // Custom text and color overrides from CMS settings
  const curtainBg = settings?.curtain_bg_color;
  const curtainEdge = settings?.curtain_edge_color;
  const eyebrowText = settings?.curtain_eyebrow_text || "★ PADHARO MHARE DESH ★";
  const eyebrowColor = settings?.curtain_eyebrow_color;
  const titleText = settings?.curtain_title_text || "Raj Mandir";
  const titleColor = settings?.curtain_title_color || settings?.curtain_text_color;
  const subtitleText = settings?.curtain_subtitle_text || "— a palace awakens —";
  const subtitleColor = settings?.curtain_subtitle_color;

  // Dynamic fabric pleating overlay with custom color
  const curtainStyle: React.CSSProperties = curtainBg
    ? {
        backgroundColor: curtainBg,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0px, rgba(255, 255, 255, 0.12) 14px, rgba(212, 175, 55, 0.22) 22px, rgba(255, 255, 255, 0.08) 26px, rgba(0, 0, 0, 0.4) 32px, rgba(0, 0, 0, 0.65) 44px), linear-gradient(135deg, ${curtainBg}, rgba(0,0,0,0.85))`,
        boxShadow: "inset 0 0 140px rgba(0, 0, 0, 0.85), 0 0 90px rgba(0, 0, 0, 0.7)",
      }
    : {};

  const edgeStyle: React.CSSProperties = curtainEdge
    ? {
        background: `linear-gradient(180deg, ${curtainEdge} 0%, #ffffff 50%, ${curtainEdge} 100%)`,
        boxShadow: `0 0 16px ${curtainEdge}, 0 0 28px ${curtainEdge}`,
      }
    : {};

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden
    >
      {/* Title sandwiched between curtains */}
      <div
        ref={titleRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
      >
        <div
          className={`font-serif-sc tracking-[0.55em] text-xs md:text-sm mb-6 font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] ${
            eyebrowColor ? "" : "text-heritage-orange"
          }`}
          style={eyebrowColor ? { color: eyebrowColor } : undefined}
        >
          {eyebrowText}
        </div>
        <div
          className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] ${
            titleColor
              ? ""
              : "bg-gradient-to-r from-[#ffe4b5] via-[#d4af37] to-[#e67e22] bg-clip-text text-transparent"
          }`}
          style={titleColor ? { color: titleColor } : undefined}
        >
          {titleText}
        </div>
        <div
          className={`font-serif italic mt-4 text-lg md:text-xl tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-medium ${
            subtitleColor ? "" : "text-[#faf6f0]/95"
          }`}
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitleText}
        </div>
      </div>

      <div
        ref={leftRef}
        className="royal-curtain absolute top-0 left-0 h-full w-[51%]"
        style={curtainStyle}
      >
        <div
          className="absolute top-0 right-0 h-full w-[3px] curtain-edge"
          style={edgeStyle}
        />
      </div>
      <div
        ref={rightRef}
        className="royal-curtain absolute top-0 right-0 h-full w-[51%]"
        style={curtainStyle}
      >
        <div
          className="absolute top-0 left-0 h-full w-[3px] curtain-edge"
          style={edgeStyle}
        />
      </div>
    </div>
  );
};
