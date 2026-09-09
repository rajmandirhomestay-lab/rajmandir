import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import about from "@/assets/about-palace.jpg";
import { Link } from "react-router-dom";

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
    <section id="about" ref={ref} className="relative py-32 px-6 bg-gradient-to-b from-[#071927] via-[#0b334d] to-[#082438] text-white overflow-hidden border-b border-[#0284c7]/30">
      {/* Subtle sandstone carved pattern & cyan ambient glow */}
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center z-10">
        <div className="about-img jharokha-frame aspect-[4/5] relative shadow-2xl border border-[#0284c7]/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <img
            src={about}
            alt="Candlelit hall of Raj Mandir Hotel at night"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            width={1536}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071927]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="about-text">
          <div className="font-serif-sc text-[#38bdf8] tracking-[0.5em] text-xs mb-4 font-bold uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">★ OUR STORY ★</div>
          <h2 className="font-display text-5xl md:text-6xl leading-tight text-white font-bold">
            A Legacy of <span className="text-[#38bdf8] italic">Warm Welcome</span>.
          </h2>
          <div className="divider-gold mt-6 max-w-xs">
            <span className="font-display text-[#38bdf8] text-xl">❖</span>
          </div>
          <p className="mt-8 font-serif text-xl leading-relaxed text-sky-100/90 font-medium">
            Built in 1894 at the foot of Mehrangarh Fort, Raj Mandir was once the
            summer residence of a Marwari noble. Sandstone carved by hand,
            jharokha balconies that catch the desert wind, and frescoes touched
            by both Mughal and Rajput hands.
          </p>
          <p className="mt-5 font-serif italic text-lg leading-relaxed text-sky-200/80">
            Today, our family opens these doors as guardians — not owners —
            inviting travelers to walk softly through history.
          </p>

          <div className="stats-row mt-12 grid grid-cols-3 gap-6 border-t border-[#0284c7]/30 pt-10">
            {[
              { n: "130+", l: "YEARS OF LEGACY" },
              { n: "12", l: "ROYAL CHAMBERS" },
              { n: "4.9", l: "GUEST RATING" },
            ].map((s) => (
              <div key={s.l} className="about-stat text-center">
                <div className="font-display text-4xl md:text-5xl text-[#38bdf8] font-bold drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">{s.n}</div>
                <div className="mt-2 font-serif-sc text-[10px] tracking-[0.3em] text-gold font-bold">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-2">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-serif-sc tracking-[0.3em] text-xs px-8 py-4 bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#0284c7] text-white font-bold rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] transition-all duration-300 uppercase border border-cyan-300/40"
            >
              DISCOVER OUR LEGACY →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
