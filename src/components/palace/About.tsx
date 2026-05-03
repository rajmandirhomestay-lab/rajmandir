import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import about from "@/assets/about-palace.jpg";
import { DustParticles } from "./DustParticles";

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-img", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        x: -60, opacity: 0, duration: 1.6, ease: "power3.out",
      });
      gsap.from(".about-text > *", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        y: 40, opacity: 0, duration: 1.2, stagger: 0.18, ease: "power3.out",
      });
      gsap.from(".about-stat", {
        scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
        y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={ref} className="relative py-32 px-6 bg-gradient-night text-ivory overflow-hidden">
      <DustParticles count={20} />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="about-img jharokha-frame aspect-[4/5] relative">
          <img
            src={about}
            alt="Candlelit hall of Raj Mandir Guest House at night"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            width={1536}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 to-transparent" />
        </div>

        <div className="about-text">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs mb-4">★ OUR HERITAGE ★</div>
          <h2 className="font-display text-5xl md:text-6xl leading-tight">
            A century of <span className="text-gold-gradient italic">whispered</span> stories.
          </h2>
          <div className="divider-gold mt-6 max-w-xs">
            <span className="font-display text-gold text-xl">❖</span>
          </div>
          <p className="mt-8 font-serif text-xl leading-relaxed text-ivory/85">
            Built in 1894 at the foot of Mehrangarh Fort, Raj Mandir was once the
            summer residence of a Marwari noble. Sandstone carved by hand,
            jharokha balconies that catch the desert wind, and frescoes touched
            by both Mughal and Rajput hands.
          </p>
          <p className="mt-5 font-serif italic text-lg leading-relaxed text-ivory/70">
            Today, our family opens these doors as guardians — not owners —
            inviting travelers to walk softly through history.
          </p>

          <div className="stats-row mt-12 grid grid-cols-3 gap-6 border-t border-gold/30 pt-10">
            {[
              { n: "130+", l: "YEARS OF LEGACY" },
              { n: "12", l: "ROYAL CHAMBERS" },
              { n: "4.9", l: "GUEST RATING" },
            ].map((s) => (
              <div key={s.l} className="about-stat text-center">
                <div className="font-display text-4xl md:text-5xl text-gold-gradient">{s.n}</div>
                <div className="mt-2 font-serif-sc text-[10px] tracking-[0.3em] text-ivory/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
