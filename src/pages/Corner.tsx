import { useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { X, Sparkles } from "lucide-react";
import { useGallery, usePageHero } from "@/lib/api";

import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import room1 from "@/assets/room-haveli.jpg";
import dining1 from "@/assets/dining-rooftop.jpg";

const fallbackCornerItems = [
  { id: "c1", src: g4, title: "Canopy Jharokha Corner", category: "Corner" },
  { id: "c2", src: g2, title: "Blue City Balcony", category: "Corner" },
  { id: "c3", src: g3, title: "Courtyard Twilight Nook", category: "Corner" },
  { id: "c4", src: g1, title: "Royal Painted Gallery Corner", category: "Corner" },
  { id: "c5", src: g5, title: "Rooftop Mehrangarh Viewpoint", category: "Corner" },
  { id: "c6", src: g6, title: "Sandstone Elephant Doorway", category: "Corner" },
  { id: "c7", src: room1, title: "Haveli Arch Passage", category: "Corner" },
  { id: "c8", src: dining1, title: "Sunset Dining Pergola", category: "Corner" },
];

const aspectRatios = [
  "aspect-[3/4]",   // Tall Vertical
  "aspect-[4/3]",   // Horizontal
  "aspect-[3/5]",   // Extra Tall Vertical
  "aspect-[4/5]",   // Medium Portrait
  "aspect-[16/9]",  // Wide Landscape
  "aspect-[3/4]",   // Tall Vertical
  "aspect-[4/3]",   // Horizontal
  "aspect-[3/5]",   // Extra Tall Vertical
];

export default function Corner() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { data: dbGallery } = useGallery();
  const { data: pageHero } = usePageHero('corner');

  const cornerImages = useMemo(() => {
    let imagesList = fallbackCornerItems;
    if (dbGallery && dbGallery.length > 0) {
      const filtered = dbGallery.filter(
        item => item.category && item.category.toLowerCase() === 'corner'
      );

      if (filtered.length > 0) {
        imagesList = filtered.map((item) => ({
          id: item.id,
          src: item.storage_path || item.image_url,
          title: item.title && !item.title.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? item.title : "Palace Corner",
          category: "Corner",
        }));
      }
    }

    return imagesList.map((img, i) => ({
      ...img,
      aspect: aspectRatios[i % aspectRatios.length]
    }));
  }, [dbGallery]);

  useEffect(() => {
    gsap.fromTo(
      ".corner-tile",
      { opacity: 0, y: 35, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" }
    );
  }, [cornerImages]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % cornerImages.length));
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + cornerImages.length) % cornerImages.length));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, cornerImages]);

  return (
    <PageShell
      title="The Palace Corner — Raj Mandir Heritage Hotel"
      description="Explore unique visual angles, intimate courtyards, and quiet architectural corners of Raj Mandir."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "PALACE ARCHITECTURE & NOOKS"}
        title={pageHero?.title || "The Palace"}
        accent={pageHero?.accent || "Corner"}
        subtitle={pageHero?.subtitle || "A curated exhibition of peaceful corners, ornate balconies, and timeless Jodhpur stone."}
        image={pageHero?.image_url || g4}
        alt="Palace Corner"
      />

      <section className="py-20 px-6 marble-texture min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.04),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="text-center mb-16">
            <div className="eyebrow mb-3 font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-gold" />
              CURATED CORNERS & FRAMES
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold">
              Moments Carved in <span className="text-gold italic">Heritage Stone</span>
            </h2>
            <div className="divider-gold mt-4 max-w-md mx-auto"><span className="text-gold text-xl">❖</span></div>
            <p className="font-serif italic mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every corner of Raj Mandir tells a story of royal hospitality, sandstone jharokhas, and sunlit corridors.
            </p>
          </div>

          {/* Multi-Column Photo Collage Masonry Layout */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {cornerImages.map((img, index) => (
              <div key={img.id} className="break-inside-avoid">
                <div
                  onClick={() => setLightboxIndex(index)}
                  className={`corner-tile group relative w-full overflow-hidden bg-card border border-gold/20 rounded-sm cursor-pointer shadow-md hover:shadow-gold transition-all duration-500 block ${img.aspect}`}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/85 via-royal-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                    <div className="font-serif-sc text-[9px] tracking-[0.3em] text-gold uppercase mb-1 font-bold">
                      ★ CORNER EXHIBITION ★
                    </div>
                    <h3 className="font-display text-lg text-white font-bold leading-tight">
                      {img.title}
                    </h3>
                  </div>

                  {/* Golden Border Frame */}
                  <div className="absolute inset-3 border border-gold/0 group-hover:border-gold/50 transition-colors duration-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Viewer */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-royal-deep/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-gold hover:text-gold-glow p-2 bg-black/40 rounded-full"
              aria-label="Close viewer"
            >
              <X size={28} />
            </button>
            <div className="relative max-w-4xl w-full text-center" onClick={(e) => e.stopPropagation()}>
              <div className="relative border border-gold/40 shadow-gold p-2 bg-card/60 rounded-sm">
                <img
                  src={cornerImages[lightboxIndex].src}
                  alt={cornerImages[lightboxIndex].title}
                  className="w-full max-h-[75vh] object-contain mx-auto"
                />
              </div>
              <div className="mt-6 font-display text-2xl text-white font-bold">{cornerImages[lightboxIndex].title}</div>
              <div className="font-serif-sc text-gold text-xs tracking-widest mt-1">PALACE CORNER EXHIBITION</div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
