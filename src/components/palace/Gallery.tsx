import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

gsap.registerPlugin(ScrollTrigger);

const photos = [
  { src: g1, alt: "Painted royal hall with gilded portraits", span: "row-span-2" },
  { src: g2, alt: "Carved jharokha overlooking the blue city", span: "" },
  { src: g3, alt: "Lantern-lit courtyard at twilight", span: "row-span-2" },
  { src: g4, alt: "Maharaja chamber with canopy bed", span: "" },
  { src: g5, alt: "Rooftop dining facing Mehrangarh fort", span: "" },
  { src: g6, alt: "Carved sandstone elephant doorway", span: "" },
];

export const Gallery = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".g-tile",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
      gsap.utils.toArray<HTMLElement>(".g-img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((p) => (p === null ? 0 : (p + 1) % photos.length));
      if (e.key === "ArrowLeft") setActive((p) => (p === null ? 0 : (p - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section ref={ref} id="gallery" className="relative py-32 px-6 overflow-hidden marble-texture">
      <div className="absolute inset-0 light-rays opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">★ THE PALACE EXHIBITION ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Walk the <span className="text-gold-gradient italic">corridors</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
          <p className="font-serif italic mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Frames suspended in stone — moments from a palace that has watched a century pass.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4 md:gap-6">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`g-tile group relative overflow-hidden jharokha-frame ${p.span} ${i % 3 === 0 ? "col-span-2" : ""}`}
              aria-label={`Open ${p.alt}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="g-img absolute inset-0 h-[120%] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/80 via-royal-deep/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="font-serif-sc text-ivory text-[11px] tracking-[0.3em]">{p.alt.toUpperCase()}</div>
              </div>
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/0 group-hover:ring-gold/60 transition-all duration-700 pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {/* Cinematic viewer */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-royal-deep/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 text-gold hover:text-gold-glow p-2"
            aria-label="Close viewer"
          >
            <X size={28} />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -inset-2 bg-gradient-gold opacity-60 blur-lg" />
            <img
              src={photos[active].src}
              alt={photos[active].alt}
              className="relative w-full max-h-[80vh] object-contain shadow-gold"
            />
            <div className="text-center mt-6 font-serif italic text-ivory/80">{photos[active].alt}</div>
          </div>
        </div>
      )}
    </section>
  );
};
