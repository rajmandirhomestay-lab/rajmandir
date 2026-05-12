import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import roomBg from "@/assets/gallery-4.jpg";
import diningBg from "@/assets/gallery-5.jpg";
import heritageBg from "@/assets/gallery-1.jpg";
import { useOffers } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const offers = [
  {
    id: "royal-honeymoon",
    title: "The Royal Honeymoon",
    subtitle: "A union blessed by heritage",
    description: "Experience romance like the Maharajas. Includes a grand suite, private rooftop dining under the stars, traditional welcome, and a private desert safari.",
    image: roomBg,
    discount: "20% OFF",
    badge: "HONEYMOON",
    duration: "3 Nights / 4 Days",
  },
  {
    id: "festival-lights",
    title: "Festival of Lights",
    subtitle: "Diwali in the Blue City",
    description: "Witness Jodhpur illuminated. Enjoy special festive meals, diya lighting ceremony, and a guided tour of the illuminated Mehrangarh Fort.",
    image: heritageBg,
    discount: "SPECIAL RATE",
    badge: "FESTIVAL",
    duration: "2 Nights / 3 Days",
  },
  {
    id: "weekend-getaway",
    title: "Heritage Weekend",
    subtitle: "Escape the ordinary",
    description: "A quick retreat into history. Includes breakfast, a heritage walk, and sunset high tea on our jharokha overlooking the city.",
    image: diningBg,
    discount: "COMPLIMENTARY DINNER",
    badge: "WEEKEND",
    duration: "1 Night / 2 Days",
  },
];

export const Offers = () => {
  const ref = useRef<HTMLElement>(null);
  const { data: dbOffers } = useOffers();

  const activeOffers = dbOffers && dbOffers.length > 0
    ? dbOffers.map((o, i) => ({
        id: o.id ? o.id.toString() : `offer-${i}`,
        title: o.title,
        subtitle: o.subtitle || "Exclusive Package",
        description: o.description,
        image: o.image_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/raj-mandir/${o.image_url}` : [roomBg, heritageBg, diningBg][i % 3],
        discount: o.discount || "SPECIAL RATE",
        badge: o.badge || "OFFER",
        duration: o.valid_until ? `Valid till ${new Date(o.valid_until).toLocaleDateString()}` : "Limited Time",
      }))
    : offers;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".offer-card",
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="offers" className="relative py-32 px-6 overflow-hidden marble-texture">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.05),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="eyebrow mb-4">★ SEASONAL INVITATIONS ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Curated <span className="text-gold-gradient italic">Experiences</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
          <p className="font-serif italic mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Exclusive packages woven with luxury, romance, and the golden warmth of Rajasthan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {activeOffers.map((offer, i) => (
            <div
              key={offer.id}
              className="offer-card group relative overflow-hidden bg-card/40 backdrop-blur-md border border-gold/20 shadow-frame hover:shadow-gold hover:border-gold/50 transition-all duration-700 flex flex-col h-full rounded-sm"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-gold/90 text-royal-deep font-serif-sc tracking-widest text-[10px] px-3 py-1 shadow-md">
                    {offer.badge}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-royal-deep/80 backdrop-blur-sm border border-gold/40 text-gold font-serif-sc tracking-widest text-[10px] px-3 py-1 shadow-md">
                    {offer.discount}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative p-8 flex-grow flex flex-col bg-gradient-to-b from-transparent to-card/60">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rotate-45 bg-background border border-gold/30 flex items-center justify-center z-10 group-hover:border-gold/80 transition-colors duration-700">
                  <span className="text-gold text-xs -rotate-45">❖</span>
                </div>
                
                <div className="text-center mt-2 mb-4">
                  <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors duration-500">{offer.title}</h3>
                  <div className="font-serif italic text-sm text-gold mt-1">{offer.subtitle}</div>
                </div>
                
                <p className="font-serif text-muted-foreground text-sm text-center leading-relaxed flex-grow">
                  {offer.description}
                </p>
                
                <div className="mt-8 flex items-center justify-between border-t border-gold/10 pt-4">
                  <span className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">
                    {offer.duration}
                  </span>
                  <Link
                    to="/booking"
                    className="font-serif-sc text-[11px] tracking-[0.2em] text-gold hover:text-gold-glow transition-all duration-300 flex items-center gap-2 group/btn"
                  >
                    CLAIM OFFER <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
