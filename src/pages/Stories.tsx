import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import heroImg from "@/assets/page-stories-hero.jpg";
import bluecity from "@/assets/story-bluecity.jpg";
import stepwell from "@/assets/story-stepwell.jpg";
import bazaar from "@/assets/story-bazaar.jpg";

gsap.registerPlugin(ScrollTrigger);

const stories = [
  {
    n: "I",
    chapter: "OF INDIGO LANES",
    title: "The Blue City at Dawn",
    image: bluecity,
    body: [
      "Long before the sun reaches Mehrangarh, the lanes of the old city are already awake — woodsmoke, cardamom, the slap of dough on iron.",
      "We rise with the milk-sellers, take the narrow alley behind the haveli, and lose ourselves in walls the colour of midday sky. Every doorway is a brushstroke. Every turn, a small painting.",
      "By the time the muezzin and the temple bell sound together, you are no longer a guest in this city. You are a quiet thread in its morning.",
    ],
  },
  {
    n: "II",
    chapter: "OF STILL WATERS",
    title: "Toorji's Forgotten Stepwell",
    image: stepwell,
    body: [
      "Sandstone descending in geometry — stairs that fold into stairs, opening to a square of green water at the bottom. Toorji ki Jhalra was built in 1740 by a queen, and forgotten for two centuries.",
      "We sit on its top step at noon when the shadows are most precise. Pigeons cross the well in long arcs. Children leap from the parapet, laughing.",
      "It is the kind of place that asks for silence — not the silence of empty rooms, but the silence that comes after a long, beautiful sentence.",
    ],
  },
  {
    n: "III",
    chapter: "OF SPICE AND COLOUR",
    title: "Sardar Bazaar After Sunset",
    image: bazaar,
    body: [
      "By dusk the clock tower glows amber and the bazaar opens like a flower — chilli mountains, brass bells, marigold garlands strung overhead.",
      "Our cook walks ahead, tasting jaggery from one stall, weighing saffron at another. He does not bargain. He simply nods, and the shopkeeper nods back.",
      "We carry our small parcels home through a side lane that smells of jasmine and frying onions, and the palace doors close behind us with a soft, ancient sound.",
    ],
  },
];

const StoryBlock = ({ s, i }: { s: typeof stories[number]; i: number }) => {
  const ref = useRef<HTMLElement>(null);
  const reverse = i % 2 === 1;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: ref.current, start: "top 75%" };
      gsap.from(".st-img", { ...trig, scale: 1.15, opacity: 0, duration: 2, ease: "power3.out" } as any);
      gsap.from(".st-num", { ...trig, opacity: 0, x: reverse ? 60 : -60, duration: 1.4, ease: "power3.out" } as any);
      gsap.from(".st-text > *", { ...trig, y: 40, opacity: 0, duration: 1.1, stagger: 0.15, ease: "power3.out" } as any);
      gsap.to(".st-img img", {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [reverse]);

  return (
    <section ref={ref} className="relative py-24 lg:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 marble-texture" />
      <div className={`relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center`}>
        <div className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}>
          <div className="st-img relative aspect-[4/5] jharokha-frame overflow-hidden">
            <img src={s.image} alt={s.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" width={1600} height={1200} />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 to-transparent" />
            <DustParticles count={10} />
          </div>
        </div>
        <div className={`lg:col-span-5 st-text ${reverse ? "lg:order-1 lg:pr-10" : "lg:pl-10"}`}>
          <div className="flex items-baseline gap-6 mb-6">
            <div className="st-num font-display text-7xl md:text-8xl text-gold-gradient leading-none">{s.n}</div>
            <div className="eyebrow">{s.chapter}</div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight italic">{s.title}</h2>
          <div className="divider-gold mt-6 max-w-xs"><span className="text-gold">❖</span></div>
          {s.body.map((p, idx) => (
            <p key={idx} className={`mt-6 font-serif text-lg leading-relaxed ${idx === 0 ? "first-letter:font-display first-letter:text-5xl first-letter:text-gold-gradient first-letter:mr-2 first-letter:float-left first-letter:leading-none" : ""} text-foreground/85`}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

const StoriesPage = () => {
  return (
    <PageShell
      title="Travel Stories — Raj Mandir Guest House, Jodhpur"
      description="Royal travel diaries of Jodhpur — the blue city at dawn, Toorji's stepwell, and Sardar Bazaar at dusk. Slow, cinematic stories from Raj Mandir."
    >
      <PageHero
        eyebrow="TRAVEL DIARIES"
        title="The Royal"
        accent="Diaries"
        subtitle="Slow chapters from the blue city — kept by the keepers of Raj Mandir."
        image={heroImg}
        alt="Open travel journal with brass compass overlooking Jodhpur at dusk"
      />
      {stories.map((s, i) => (
        <StoryBlock key={s.n} s={s} i={i} />
      ))}
    </PageShell>
  );
};

export default StoriesPage;
