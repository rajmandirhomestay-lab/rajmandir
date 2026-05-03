import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Crown, Utensils, Wifi, Sparkles, Sun, BookOpen, Car, Bath } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const facilities = [
  { icon: Crown, title: "Royal Concierge", desc: "A personal khidmatgar, attentive yet unseen, anticipating every wish." },
  { icon: Utensils, title: "Heritage Kitchen", desc: "Recipes from the old royal cooks — laal maas, ker sangri, ghewar." },
  { icon: Sun, title: "Rooftop Lounge", desc: "Panoramic views of Mehrangarh from a sandstone terrace." },
  { icon: Bath, title: "Marble Hammam", desc: "Bathing chambers carved in milk-white Makrana marble." },
  { icon: BookOpen, title: "Palace Library", desc: "Hand-bound volumes, journals from desert expeditions, faded maps." },
  { icon: Sparkles, title: "Ayurvedic Spa", desc: "Oils pressed in copper vessels, traditions older than the fort itself." },
  { icon: Car, title: "Vintage Pickup", desc: "A 1947 Hindustan Ambassador for arrivals worthy of a maharaja." },
  { icon: Wifi, title: "Discreet Comforts", desc: "Quiet modern conveniences hidden behind centuries-old craft." },
];

export const Facilities = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".f-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="facilities" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 sandstone-texture opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">★ ROYAL OFFERINGS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Comforts of the <span className="text-gold-gradient italic">palace</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="f-card group relative p-8 bg-card/60 backdrop-blur-sm border border-gold/20 hover:border-gold/60 transition-all duration-700 hover:-translate-y-2 hover:shadow-gold"
            >
              {/* Carved corners */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/60" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/60" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/60" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/60" />

              <div className="relative mx-auto mb-6 w-16 h-12 jharokha bg-gradient-gold/20 border border-gold/50 flex items-center justify-center group-hover:bg-gradient-gold/40 transition-all duration-700">
                <Icon className="text-gold" size={20} />
              </div>
              <h3 className="font-display text-xl text-foreground text-center mb-3 group-hover:text-gold transition-colors duration-500">
                {title}
              </h3>
              <p className="font-serif italic text-muted-foreground text-center text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
