import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import heroImg from "@/assets/page-experiences-hero.jpg";
import safari from "@/assets/exp-safari.jpg";
import cultural from "@/assets/exp-cultural.jpg";
import fort from "@/assets/exp-fort.jpg";

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    sanskrit: "रेगिस्तान",
    kicker: "DESERT",
    title: "Caravan into the Thar",
    duration: "1 night · private camp",
    img: safari,
    body: [
      "We leave the palace at four — the hour the sun loosens its hold on Jodhpur. By dusk, the dunes of Osian glow the colour of pressed marigold, and our camels move in long, slow shadows.",
      "Camp is set in a hollow between dunes: bedouin carpets, brass lanterns, a fire of dried khejri wood. Dinner is laal maas under more stars than any city allows you to remember.",
    ],
  },
  {
    sanskrit: "संगीत",
    kicker: "FOLK NIGHT",
    title: "Kalbeliya by Firelight",
    duration: "Evenings · in the courtyard",
    img: cultural,
    body: [
      "On nights of the full moon, the courtyard is lit only by oil lamps and the inner glow of a single brazier. The Kalbeliya dancers arrive without announcement, in skirts the colour of pomegranate and crow.",
      "A sarangi sighs; a dholak begins. The dance is two hundred years old and not entirely human — half snake, half firelight. Guests sit on cushions at the edge of the courtyard and forget to breathe.",
    ],
  },
  {
    sanskrit: "मेहरानगढ़",
    kicker: "FORT WALK",
    title: "Mehrangarh at Sunrise",
    duration: "3 hours · with our historian",
    img: fort,
    body: [
      "Before the gates open to the public, our family historian walks you up the back ramparts of Mehrangarh — past the cannon scars of Jaipur's siege, into chambers most visitors never see.",
      "We stop on the eastern bastion as the sun strikes the blue city. He tells you which rooftops belong to which family, and which of them once owed our ancestors a debt of saffron.",
    ],
  },
];

const ExpBlock = ({ e, i }: { e: typeof experiences[number]; i: number }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exp-img", { scrollTrigger: { trigger: ref.current, start: "top 75%" }, scale: 1.15, opacity: 0, duration: 2, ease: "power3.out" });
      gsap.from(".exp-text > *", { scrollTrigger: { trigger: ref.current, start: "top 75%" }, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
      gsap.to(".exp-img img", { yPercent: -15, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center px-6 py-24 overflow-hidden">
      <div className="exp-img absolute inset-0 overflow-hidden">
        <img src={e.img} alt={e.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover scale-110" width={1600} height={1200} />
        <div className="absolute inset-0 bg-gradient-to-r from-royal-deep/90 via-royal-deep/60 to-royal-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 via-transparent to-royal-deep/40" />
      </div>
      <div className="absolute inset-0 light-rays opacity-40" aria-hidden />
      <DustParticles count={20} />

      <div className={`relative z-10 max-w-3xl ${i % 2 === 0 ? "ml-0 mr-auto" : "ml-auto mr-0"} exp-text text-ivory`}>
        <div className="font-serif-sc text-gold text-[10px] tracking-[0.4em] mb-3">{e.sanskrit}</div>
        <div className="eyebrow mb-4">★ {e.kicker} · {String(i + 1).padStart(2, "0")} ★</div>
        <h2 className="font-display text-5xl md:text-7xl leading-[1.05]">
          {e.title.split(" ").slice(0, -1).join(" ")} <span className="italic text-gold-gradient">{e.title.split(" ").slice(-1)}</span>
        </h2>
        <div className="divider-gold mt-6 max-w-xs"><span className="text-gold">❖</span></div>
        {e.body.map((p, idx) => (
          <p key={idx} className="mt-5 font-serif text-lg leading-relaxed text-ivory/85">{p}</p>
        ))}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div className="font-serif italic text-gold/90">{e.duration}</div>
          <a href="#" className="font-serif-sc tracking-[0.3em] text-xs px-7 py-4 border border-gold/60 text-ivory rounded-sm hover:bg-gold/10 hover:border-gold transition-all duration-700">
            ARRANGE THIS EXPERIENCE
          </a>
        </div>
      </div>
    </section>
  );
};

const ExperiencesPage = () => {
  return (
    <PageShell
      title="Royal Experiences — Raj Mandir Guest House, Jodhpur"
      description="Camel caravans into the Thar, Kalbeliya nights, and private sunrise walks of Mehrangarh — curated experiences from Raj Mandir Guest House, Jodhpur."
    >
      <PageHero
        eyebrow="THE ROYAL DAYS"
        title="A Slow"
        accent="Adventure"
        subtitle="Curated by our family — never rushed, never crowded, always with the door of the palace open behind you."
        image={heroImg}
        alt="Camel caravan silhouettes against a golden Thar desert sunset"
      />
      {experiences.map((e, i) => (
        <ExpBlock key={e.title} e={e} i={i} />
      ))}
    </PageShell>
  );
};

export default ExperiencesPage;
