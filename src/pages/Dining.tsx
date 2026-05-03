import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import heroImg from "@/assets/page-dining-hero.jpg";
import thali from "@/assets/dining-thali.jpg";
import rooftop from "@/assets/dining-rooftop.jpg";

gsap.registerPlugin(ScrollTrigger);

const menu = {
  pehla: [
    { name: "Mirchi Vada", note: "stuffed green chilli, slow-fried", price: "₹ 280" },
    { name: "Pyaaz Kachori", note: "Jodhpur's famed onion pastry", price: "₹ 240" },
    { name: "Kair Sangri Tikki", note: "desert berries & beans, crisped", price: "₹ 320" },
  ],
  raja: [
    { name: "Laal Maas", note: "lamb in mathania chillies, ghee, smoke", price: "₹ 1,180" },
    { name: "Safed Maas", note: "white almond & yoghurt curry, royal kitchens", price: "₹ 1,240" },
    { name: "Gatte ki Sabzi", note: "gram dumplings in spiced yoghurt", price: "₹ 720" },
    { name: "Ker Sangri", note: "the desert in a bowl", price: "₹ 680" },
  ],
  meetha: [
    { name: "Ghevar", note: "honeycomb disc, saffron syrup, rabri", price: "₹ 380" },
    { name: "Mawa Kachori", note: "sweet pastry of Jodhpur, almond filling", price: "₹ 360" },
  ],
};

const SectionLabel = ({ kicker, title, sanskrit }: { kicker: string; title: string; sanskrit: string }) => (
  <div className="text-center mb-14">
    <div className="font-serif-sc text-gold text-[10px] tracking-[0.4em] mb-2">{sanskrit}</div>
    <div className="eyebrow mb-3">★ {kicker} ★</div>
    <h2 className="font-display text-4xl md:text-6xl">
      <span className="text-gold-gradient italic">{title}</span>
    </h2>
    <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
  </div>
);

const DiningPage = () => {
  const hallRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const rooftopRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hall-img", { scrollTrigger: { trigger: hallRef.current, start: "top 70%" }, scale: 1.1, opacity: 0, duration: 1.8, ease: "power3.out" });
      gsap.from(".hall-text > *", { scrollTrigger: { trigger: hallRef.current, start: "top 70%" }, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
      gsap.to(".hall-img img", { yPercent: -10, ease: "none", scrollTrigger: { trigger: hallRef.current, start: "top bottom", end: "bottom top", scrub: true } });

      gsap.from(".menu-row", { scrollTrigger: { trigger: menuRef.current, start: "top 75%" }, y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out" });
      gsap.from(".menu-section", { scrollTrigger: { trigger: menuRef.current, start: "top 80%" }, y: 50, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power3.out" });

      gsap.from(".roof-img", { scrollTrigger: { trigger: rooftopRef.current, start: "top 70%" }, scale: 1.1, opacity: 0, duration: 1.8, ease: "power3.out" });
      gsap.from(".roof-text > *", { scrollTrigger: { trigger: rooftopRef.current, start: "top 70%" }, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  return (
    <PageShell
      title="Royal Dining — Raj Mandir Guest House, Jodhpur"
      description="Dine in the candlelit Sheesh Mahal or under the stars on the rooftop — Marwari thalis, laal maas and ghevar at Raj Mandir, Jodhpur."
    >
      <PageHero
        eyebrow="THE ROYAL TABLE"
        title="By Lantern"
        accent="and Candle"
        subtitle="Marwari kitchens, slow recipes, and tables that have hosted four generations of guests."
        image={heroImg}
        alt="Candlelit royal Rajasthani dining hall with chandelier and frescoed walls"
      />

      {/* The Hall */}
      <section ref={hallRef} className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 marble-texture" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 hall-text">
            <div className="eyebrow mb-3">SHEESH MAHAL</div>
            <h2 className="font-display text-4xl md:text-6xl leading-tight">
              The <span className="italic text-gold-gradient">candlelit</span> hall.
            </h2>
            <div className="divider-gold mt-6 max-w-xs"><span className="text-gold">❖</span></div>
            <p className="mt-6 font-serif text-lg leading-relaxed text-foreground/85">
              A long table of polished sheesham seats sixteen beneath a chandelier of two hundred candles. Brass thalis arrive in slow procession, served by hand, course by course, the way a Marwari household has eaten for two hundred years.
            </p>
            <p className="mt-4 font-serif italic text-lg text-muted-foreground">
              Reserved nightly · 7:30 onwards · vegetarian and non-vegetarian thalis
            </p>
          </div>
          <div className="lg:col-span-6 hall-img relative aspect-[4/5] jharokha-frame">
            <img src={thali} alt="Royal Rajasthani thali by candlelight" loading="lazy" className="absolute inset-0 h-full w-full object-cover" width={1280} height={1600} />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 to-transparent" />
            <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.25),transparent_60%)] pointer-events-none" />
            <DustParticles count={12} />
          </div>
        </div>
      </section>

      {/* Menu — scroll-revealed scroll */}
      <section ref={menuRef} className="relative py-32 px-6 bg-gradient-night text-ivory overflow-hidden">
        <div className="absolute inset-0 lattice-pattern opacity-[0.07]" />
        <DustParticles count={20} />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="eyebrow mb-3">★ THE MENU ★</div>
            <h2 className="font-display text-5xl md:text-7xl text-ivory">From the <span className="italic text-gold-gradient">Royal</span> Kitchen</h2>
            <div className="divider-gold mt-8 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
          </div>

          {[
            { key: "pehla", title: "First Tastes", sanskrit: "पहला स्वाद", items: menu.pehla },
            { key: "raja", title: "The Royal Plates", sanskrit: "राजसी थाली", items: menu.raja },
            { key: "meetha", title: "Sweet Endings", sanskrit: "मीठा", items: menu.meetha },
          ].map((sec) => (
            <div key={sec.key} className="menu-section mb-20">
              <div className="flex items-baseline justify-between border-b border-gold/30 pb-4 mb-8">
                <div>
                  <div className="font-serif-sc text-gold text-[10px] tracking-[0.4em]">{sec.sanskrit}</div>
                  <h3 className="font-display text-3xl md:text-4xl text-ivory">{sec.title}</h3>
                </div>
                <span className="text-gold text-2xl">❖</span>
              </div>
              <ul className="space-y-6">
                {sec.items.map((it) => (
                  <li key={it.name} className="menu-row grid grid-cols-[1fr_auto] items-baseline gap-6">
                    <div>
                      <div className="font-display text-xl md:text-2xl text-ivory">{it.name}</div>
                      <div className="font-serif italic text-ivory/60 mt-1">{it.note}</div>
                    </div>
                    <div className="font-serif-sc text-gold tracking-[0.2em] text-sm whitespace-nowrap">{it.price}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Rooftop */}
      <section ref={rooftopRef} className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 marble-texture" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 roof-img relative aspect-[4/5] jharokha-frame">
            <img src={rooftop} alt="Rooftop dining overlooking Mehrangarh Fort at night" loading="lazy" className="absolute inset-0 h-full w-full object-cover" width={1280} height={1600} />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 to-transparent" />
          </div>
          <div className="lg:col-span-5 roof-text lg:pl-8">
            <div className="eyebrow mb-3">CHANDNI TERRACE</div>
            <h2 className="font-display text-4xl md:text-6xl leading-tight">Beneath the <span className="italic text-gold-gradient">moonlit</span> fort.</h2>
            <div className="divider-gold mt-6 max-w-xs"><span className="text-gold">❖</span></div>
            <p className="mt-6 font-serif text-lg leading-relaxed text-foreground/85">
              On clear nights, our smaller terrace opens for two — low tables, brass lanterns, and Mehrangarh lit gold against an indigo sky. A private menu, a folk singer at a respectful distance.
            </p>
            <a href="#" className="mt-8 inline-block font-serif-sc tracking-[0.3em] text-xs px-7 py-4 bg-gradient-gold text-royal-deep rounded-sm hover:shadow-gold transition-all duration-700">
              RESERVE THE TERRACE
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default DiningPage;
