import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { useTimelineEras, useHomepageSections } from "@/lib/api";

import heroImgFallback from "@/assets/page-about-hero.jpg";
import era1 from "@/assets/about-1894.jpg";
import era2 from "@/assets/about-restore.jpg";
import era3 from "@/assets/about-today.jpg";

gsap.registerPlugin(ScrollTrigger);

const eras = [
  {
    year: "1894",
    title: "The Foundation",
    image: era1,
    body:
      "Raj Mandir was raised at the foot of Mehrangarh by Thakur Bhairon Singh of Jaitaran, as a summer residence for his household. Built of locally quarried Jodhpur sandstone, with carved jharokhas by craftsmen from Makrana, it took five years and three master masons to complete.",
  },
  {
    year: "1947 — 1980",
    title: "The Quiet Years",
    image: era2,
    body:
      "After Independence, the palace fell into a long, gentle silence. The fountains slept; the frescoes faded a little each monsoon. Three generations of caretakers kept the courtyard swept and the lamps lit on festival nights, waiting.",
  },
  {
    year: "1998 — 2012",
    title: "The Restoration",
    image: era2,
    body:
      "Our grandfather, Thakur Vikram Singh, returned from Bombay with a single intention — to restore Raj Mandir leaf by leaf, fresco by fresco. Original artisans were sought from Nathdwara and Bikaner. Lime plaster, vegetable pigments, no shortcuts. It took fourteen years.",
  },
  {
    year: "TODAY",
    title: "Guardians, Not Owners",
    image: era3,
    body:
      "We opened our doors as a small heritage guest house in 2014 — twelve chambers, one family, one promise. We do not run a hotel. We invite you into a home that has been kept ready for you for one hundred and thirty years.",
  },
];

const TimelineEra = ({ e, i }: { e: typeof eras[number]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reverse = i % 2 === 1;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".era-img", { scrollTrigger: { trigger: ref.current, start: "top 75%" }, scale: 1.12, opacity: 0, duration: 1.8, ease: "power3.out" });
      gsap.from(".era-year", { scrollTrigger: { trigger: ref.current, start: "top 75%" }, x: reverse ? 60 : -60, opacity: 0, duration: 1.4, ease: "power3.out" });
      gsap.from(".era-text > *", { scrollTrigger: { trigger: ref.current, start: "top 75%" }, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
      gsap.from(".era-dot", { scrollTrigger: { trigger: ref.current, start: "top 80%" }, scale: 0, opacity: 0, duration: 1, ease: "back.out(2)" });
    }, ref);
    return () => ctx.revert();
  }, [reverse]);

  return (
    <div ref={ref} className="relative py-20 lg:py-28">
      {/* Center thread + dot */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px gold-thread" />
      <div className="hidden lg:block era-dot absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-gold shadow-gold" />

      <div className={`max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center ${reverse ? "" : ""}`}>
        <div className={`era-img relative aspect-[4/5] jharokha-frame ${reverse ? "lg:order-2" : ""}`}>
          <img src={e.image} alt={`${e.year} — ${e.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover sepia-[0.15]" width={1400} height={1000} />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--royal-deep)/0.6))] pointer-events-none" />
        </div>
        <div className={`era-text ${reverse ? "lg:order-1 lg:text-right lg:pr-12" : "lg:pl-12"}`}>
          <div className="era-year font-display text-6xl md:text-7xl text-gold-gradient mb-4">{e.year}</div>
          <h3 className="font-display text-3xl md:text-5xl italic">{e.title}</h3>
          <div className={`divider-gold mt-6 max-w-xs ${reverse ? "lg:ml-auto" : ""}`}><span className="text-gold">❖</span></div>
          <p className="mt-6 font-serif text-lg leading-relaxed text-foreground/85">{e.body}</p>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const introRef = useRef<HTMLElement>(null);
  const { data: dbEras } = useTimelineEras();
  const { data: sections } = useHomepageSections();

  const aboutSection = sections?.find(s => s.section_key === 'about');
  const heroImg = aboutSection?.content?.image_url || heroImgFallback;

  const displayEras = dbEras && dbEras.length > 0
    ? dbEras.map((e, i) => ({
        year: e.year,
        title: e.title,
        image: e.image_url || eras[i % eras.length].image,
        body: e.body
      }))
    : eras;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".intro > *", { scrollTrigger: { trigger: introRef.current, start: "top 75%" }, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  return (
    <PageShell
      title="Our Heritage — Raj Mandir Guest House, Jodhpur"
      description="The story of Raj Mandir — a Marwari haveli at the foot of Mehrangarh, restored leaf by leaf and opened as a heritage guest house in Jodhpur."
    >
      <PageHero
        eyebrow="OUR HERITAGE"
        title="A Hundred"
        accent="and Thirty Years"
        subtitle="The story of a sandstone home at the foot of Mehrangarh — and the family that has kept its lamps lit."
        image={heroImg}
        alt="Sepia archival photograph of Marwari noble family at a Jodhpur haveli, 1894"
      />

      <section ref={introRef} className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 marble-texture" />
        <DustParticles count={16} />
        <div className="relative max-w-3xl mx-auto text-center intro">
          <div className="eyebrow mb-4">★ A SHORT PREFACE ★</div>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            We are <span className="italic text-gold-gradient">guardians</span>, not owners.
          </h2>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
          <p className="mt-8 font-serif italic text-xl text-foreground/80 leading-relaxed">
            Four generations have lived in these walls. Children have grown up in the courtyard, brides have crossed the threshold, and the same brass bell has rung at sunrise for one hundred and thirty winters.
          </p>
          <p className="mt-6 font-serif text-lg text-foreground/70 leading-relaxed">
            What follows is a short history — told in four chapters, the way we tell it to friends who come to stay.
          </p>
        </div>
      </section>

      <section className="relative bg-gradient-night text-ivory">
        <div className="absolute inset-0 lattice-pattern opacity-[0.05]" />
        <DustParticles count={24} />
        <div className="relative">
          {displayEras.map((e, i) => (
            <TimelineEra key={e.year + i} e={e} i={i} />
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto text-center py-32 px-6">
          <div className="eyebrow mb-4">★ AN INVITATION ★</div>
          <h3 className="font-display text-4xl md:text-5xl text-ivory leading-tight">
            Come, walk softly through the <span className="italic text-gold-gradient">history</span>.
          </h3>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
          <a href="/rooms" className="mt-10 inline-block font-serif-sc tracking-[0.3em] text-xs px-9 py-4 bg-gradient-gold text-royal-deep rounded-sm hover:shadow-gold transition-all duration-700">
            ENTER THE PALACE
          </a>
        </div>
      </section>
    </PageShell>
  );
};

export default AboutPage;
