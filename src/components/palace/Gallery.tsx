import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { useGallery } from "@/lib/api";

import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import room1 from "@/assets/room-haveli.jpg";
import room2 from "@/assets/room-maharaja.jpg";
import room3 from "@/assets/room-rajwada.jpg";
import dining1 from "@/assets/dining-rooftop.jpg";
import dining2 from "@/assets/dining-thali.jpg";
import exp1 from "@/assets/exp-cultural.jpg";

gsap.registerPlugin(ScrollTrigger);

const fallbackPhotos = [
  { src: g1, alt: "Painted royal hall with gilded portraits" },
  { src: g2, alt: "Carved jharokha overlooking the blue city" },
  { src: g3, alt: "Lantern-lit courtyard at twilight" },
  { src: g4, alt: "Maharaja chamber with canopy bed" },
  { src: g5, alt: "Rooftop dining facing Mehrangarh fort" },
  { src: g6, alt: "Carved sandstone elephant doorway" },
  { src: room1, alt: "Haveli Suite Interior" },
  { src: room2, alt: "Maharaja Chamber Suite" },
  { src: room3, alt: "Rajwada Room Heritage Details" },
  { src: dining1, alt: "Rooftop Dining Ambience" },
  { src: dining2, alt: "Traditional Thali Feast" },
  { src: exp1, alt: "Cultural Music Performance" },
];

const aspectRatios = [
  "aspect-[4/3]",   // Horizontal
  "aspect-[3/4]",   // Tall Vertical
  "aspect-[3/5]",   // Extra Tall Vertical
  "aspect-[3/4]",   // Tall Vertical
  "aspect-[16/9]",  // Wide Landscape
  "aspect-[4/5]",   // Medium Portrait
  "aspect-[3/4]",   // Tall Vertical
  "aspect-[16/9]",  // Wide Landscape
  "aspect-[4/3]",   // Horizontal
  "aspect-[3/5]",   // Tall Vertical
  "aspect-[3/4]",   // Medium Portrait
  "aspect-[16/9]"   // Landscape
];

export const Gallery = () => {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const { data: dbGallery } = useGallery();

  const activePhotos = useMemo(() => {
    let photosList = fallbackPhotos;
    if (dbGallery && dbGallery.length > 0) {
      const mappedDb = dbGallery.map((item, index) => {
        const titleText = item.title && !item.title.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? item.title : "Raj Mandir Gallery";
        return {
          src: item.storage_path || item.image_url || fallbackPhotos[index % fallbackPhotos.length].src,
          alt: titleText,
        };
      });
      
      const combined = [...mappedDb];
      while (combined.length < 12) {
        combined.push(fallbackPhotos[combined.length % fallbackPhotos.length]);
      }
      photosList = combined.slice(0, 12);
    }

    return photosList.map((photo, i) => ({
      ...photo,
      aspect: aspectRatios[i % aspectRatios.length]
    }));
  }, [dbGallery]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".g-tile",
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [activePhotos]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((p) => (p === null ? 0 : (p + 1) % activePhotos.length));
      if (e.key === "ArrowLeft") setActive((p) => (p === null ? 0 : (p - 1 + activePhotos.length) % activePhotos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activePhotos]);

  return (
    <section ref={ref} id="gallery" className="relative py-28 px-6 overflow-hidden bg-background marble-texture border-b border-gold/20">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase">★ CAPTURED MEMORIES ★</div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground font-bold">
            A Glimpse of <span className="text-heritage-gradient italic">Raj Mandir</span>
          </h2>
          <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
          <p className="font-serif italic mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Frames suspended in stone — moments from a palace that has watched a century pass.
          </p>
        </div>

        {/* Multi-Column Photo Collage Masonry */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {activePhotos.map((p, i) => (
            <div key={i} className="break-inside-avoid">
              <button
                onClick={() => navigate('/corner')}
                className={`g-tile group relative w-full overflow-hidden rounded-sm shadow-md hover:shadow-gold transition-all duration-500 border border-gold/20 block ${p.aspect}`}
                aria-label={`View photo ${i + 1}`}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className="g-img absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <div className="font-serif-sc text-xs text-gold font-semibold truncate text-left w-full">{p.alt}</div>
                </div>
                <div className="absolute inset-0 ring-1 ring-inset ring-gold/0 group-hover:ring-gold/60 transition-all duration-500 pointer-events-none" />
              </button>
            </div>
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
            className="absolute top-6 right-6 text-gold hover:text-gold-glow p-2 bg-black/40 rounded-full"
            aria-label="Close viewer"
          >
            <X size={28} />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -inset-2 bg-gradient-gold opacity-60 blur-lg" />
            <img
              src={activePhotos[active].src}
              alt={activePhotos[active].alt}
              className="relative w-full max-h-[80vh] object-contain shadow-gold border border-gold/40"
            />
            <div className="text-center mt-6 font-serif italic text-ivory/90 text-lg font-medium">{activePhotos[active].alt}</div>
          </div>
        </div>
      )}
    </section>
  );
};
