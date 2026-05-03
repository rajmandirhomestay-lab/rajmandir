import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import maharaja from "@/assets/room-maharaja.jpg";
import rajwada from "@/assets/room-rajwada.jpg";
import haveli from "@/assets/room-haveli.jpg";

gsap.registerPlugin(ScrollTrigger);

const rooms = [
  {
    name: "Maharaja Suite",
    sanskrit: "महाराजा",
    img: maharaja,
    desc: "A canopied four-poster, frescoed walls, and the hush of brass lanterns at dusk.",
    price: "₹ 14,500",
  },
  {
    name: "Rajwada Chamber",
    sanskrit: "राजवाड़ा",
    img: rajwada,
    desc: "Jharokha windows framing the indigo rooftops of Jodhpur's old city.",
    price: "₹ 9,800",
  },
  {
    name: "Haveli Courtyard",
    sanskrit: "हवेली",
    img: haveli,
    desc: "A painted ceiling of lapis and gold above heirloom carpets and quiet fountains.",
    price: "₹ 7,200",
  },
];

export const Rooms = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".room-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 1.6,
        ease: "power3.out",
        stagger: 0.25,
      });
      gsap.from(".rooms-eyebrow > *", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="rooms" ref={sectionRef} className="relative py-32 px-6 overflow-hidden stone-texture">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 rooms-eyebrow">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs mb-4">★ THE CHAMBERS ★</div>
          <h2 className="font-display text-5xl md:text-7xl text-foreground">
            Royal <span className="text-gold-gradient italic">Quarters</span>
          </h2>
          <div className="divider-gold max-w-md mx-auto mt-6">
            <span className="font-display text-gold text-xl">❖</span>
          </div>
          <p className="mt-6 font-serif italic text-xl text-muted-foreground max-w-2xl mx-auto">
            Three sanctuaries — each a different verse from the same royal poem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
          {rooms.map((r) => (
            <article key={r.name} className="room-card group">
              {/* Jharokha framed image */}
              <div className="jharokha-frame glow-hover bg-card aspect-[3/4] relative">
                <img
                  src={r.img}
                  alt={`${r.name} — ${r.desc}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                  width={1024}
                  height={1280}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/90 via-royal-deep/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-ivory">
                  <div className="font-serif-sc text-gold text-[10px] tracking-[0.4em] mb-1">{r.sanskrit}</div>
                  <div className="font-display text-2xl">{r.name}</div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.25),transparent_70%)] pointer-events-none" />
              </div>

              <div className="mt-8 px-2 text-center">
                <p className="font-serif italic text-lg text-muted-foreground leading-relaxed">{r.desc}</p>
                <div className="divider-gold mt-6 max-w-[140px] mx-auto">
                  <span className="text-gold text-sm">✧</span>
                </div>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <span className="font-display text-2xl text-gold-gradient">{r.price}</span>
                  <span className="font-serif-sc text-[10px] tracking-[0.3em] text-muted-foreground">/ NIGHT</span>
                </div>
                <a
                  href="#"
                  className="mt-6 inline-block font-serif-sc tracking-[0.3em] text-xs text-foreground border-b border-gold/60 pb-1 hover:text-gold transition-colors duration-500"
                >
                  RESERVE THIS CHAMBER
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
