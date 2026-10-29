import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/api";

export const CurtainOpener = ({ onComplete }: { onComplete?: () => void }) => {
  const { data: settings } = useSettings();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  const openingRef = useRef(false);
  const hasAnimatedEntranceRef = useRef(false);
  const canInteractRef = useRef(false);

  const openCurtain = useCallback(() => {
    if (openingRef.current || done) return;
    openingRef.current = true;

    // Kill any running entrance tweens immediately to prevent conflicting transforms
    if (titleRef.current) gsap.killTweensOf(titleRef.current);
    if (leftRef.current) gsap.killTweensOf(leftRef.current);
    if (rightRef.current) gsap.killTweensOf(rightRef.current);

    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true);
        onComplete?.();
      },
    });

    // 1. Title glides up and fades out cleanly
    if (titleRef.current) {
      tl.to(titleRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.35,
        ease: "power2.in",
      });
    }

    // 2. Curtains part smoothly to left and right
    tl.to(
      leftRef.current,
      { xPercent: -102, duration: 1.25, ease: "power4.inOut" },
      "-=0.1"
    )
      .to(
        rightRef.current,
        { xPercent: 102, duration: 1.25, ease: "power4.inOut" },
        "<"
      )
      .to(
        wrapRef.current,
        { autoAlpha: 0, duration: 0.2, pointerEvents: "none" },
        "-=0.2"
      );
  }, [done, onComplete]);

  // Handle user mouse movement / interaction safely without hair-trigger false positives
  const handleInteraction = useCallback(() => {
    if (!canInteractRef.current) return;
    openCurtain();
  }, [openCurtain]);

  useEffect(() => {
    // If curtain is explicitly disabled in CMS settings, skip it
    if (settings && settings.curtain_enabled === false) {
      setDone(true);
      onComplete?.();
      return;
    }

    // Ensure entrance animation ONLY runs once in component lifecycle — never re-triggers or shakes
    if (!hasAnimatedEntranceRef.current && titleRef.current) {
      hasAnimatedEntranceRef.current = true;
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }
      );
    }

    // Small 200ms grace period so initial cursor location doesn't trigger instantly before user moves
    const graceTimer = setTimeout(() => {
      canInteractRef.current = true;
    }, 200);

    // Auto-open safety timer after 6s in case no cursor movement occurs
    const autoTimer = setTimeout(() => {
      openCurtain();
    }, 6000);

    return () => {
      clearTimeout(graceTimer);
      clearTimeout(autoTimer);
    };
  }, []); // Static dependency array ensures no re-running on settings loads!

  if (done || settings?.curtain_enabled === false) return null;

  // Custom text overrides from CMS (stable fallback text)
  const eyebrowText = settings?.curtain_eyebrow_text || "★ PADHARO MHARE DESH ★";
  const titleText = settings?.curtain_title_text || "Raj Mandir";
  const subtitleText = settings?.curtain_subtitle_text || "— a palace awakens —";

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleInteraction}
      onMouseEnter={handleInteraction}
      onClick={openCurtain}
      onTouchStart={openCurtain}
      className="fixed inset-0 z-[100] cursor-pointer pointer-events-auto"
      aria-hidden
    >
      {/* Title positioned elegantly on curtains */}
      <div
        ref={titleRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none select-none"
      >
        <div className="font-serif-sc tracking-[0.55em] text-xs md:text-sm mb-4 font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] text-heritage-orange">
          {eyebrowText}
        </div>
        <div className="font-display text-5xl md:text-7xl lg:text-8xl font-bold drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] bg-gradient-to-r from-[#ffe4b5] via-[#d4af37] to-[#e67e22] bg-clip-text text-transparent">
          {titleText}
        </div>
        <div className="font-serif italic mt-3 text-lg md:text-xl tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-medium text-[#faf6f0]/95">
          {subtitleText}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 font-serif-sc tracking-[0.35em] text-[11px] text-gold/90 px-5 py-2 border border-gold/30 rounded-full bg-black/40 backdrop-blur-sm shadow-lg">
          ✦ MOVE CURSOR TO OPEN ✦
        </div>
      </div>

      <div
        ref={leftRef}
        className="royal-curtain absolute top-0 left-0 h-full w-[51%]"
      >
        <div className="absolute top-0 right-0 h-full w-[3px] curtain-edge" />
      </div>
      <div
        ref={rightRef}
        className="royal-curtain absolute top-0 right-0 h-full w-[51%]"
      >
        <div className="absolute top-0 left-0 h-full w-[3px] curtain-edge" />
      </div>
    </div>
  );
};
