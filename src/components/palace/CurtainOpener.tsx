import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const CurtainOpener = ({ onComplete }: { onComplete?: () => void }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
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
  }, [onComplete]);

  if (done) return null;

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
        <div className="font-serif-sc text-gold tracking-[0.5em] text-xs md:text-sm mb-6 opacity-80">
          PADHARO MHARE DESH
        </div>
        <div className="text-gold-gradient font-display text-5xl md:text-7xl lg:text-8xl drop-shadow-[0_0_30px_hsl(var(--gold)/0.4)]">
          Raj Mandir
        </div>
        <div className="font-serif italic text-ivory/80 mt-4 text-lg md:text-xl tracking-widest">
          — a palace awakens —
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
