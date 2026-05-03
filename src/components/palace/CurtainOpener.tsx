import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const CurtainOpener = ({ onComplete }: { onComplete?: () => void }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true);
        onComplete?.();
      },
    });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, scale: 0.92, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: "power3.out" }
    )
      .to(titleRef.current, { opacity: 0, duration: 0.8, ease: "power2.in" }, "+=1.1")
      .to(
        leftRef.current,
        { xPercent: -102, duration: 2.2, ease: "power4.inOut" },
        "-=0.4"
      )
      .to(
        rightRef.current,
        { xPercent: 102, duration: 2.2, ease: "power4.inOut" },
        "<"
      )
      .to(wrapRef.current, { autoAlpha: 0, duration: 0.4, pointerEvents: "none" }, "-=0.2");
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
