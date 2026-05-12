import { useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { X } from "lucide-react";
import { useGallery } from "@/lib/api";

import room1 from "@/assets/room-haveli.jpg";
import room2 from "@/assets/room-maharaja.jpg";
import room3 from "@/assets/room-rajwada.jpg";
import dining1 from "@/assets/dining-rooftop.jpg";
import dining2 from "@/assets/dining-thali.jpg";
import dining3 from "@/assets/page-dining-hero.jpg";
import exp1 from "@/assets/exp-cultural.jpg";
import exp2 from "@/assets/exp-fort.jpg";
import exp3 from "@/assets/exp-safari.jpg";
import heritage1 from "@/assets/gallery-1.jpg";
import heritage2 from "@/assets/gallery-2.jpg";
import heritage3 from "@/assets/gallery-3.jpg";
import jod1 from "@/assets/story-bluecity.jpg";
import jod2 from "@/assets/story-stepwell.jpg";
import jod3 from "@/assets/story-bazaar.jpg";
import heroImg from "@/assets/gallery-4.jpg";

type Category = "All" | "Rooms" | "Dining" | "Experiences" | "Heritage" | "Jodhpur";

const categories: Category[] = ["All", "Rooms", "Dining", "Experiences", "Heritage", "Jodhpur"];

const initialGalleryItems = [
  { id: 1, src: room1, category: "Rooms", title: "Haveli Suite", span: "md:col-span-2 md:row-span-2" },
  { id: 2, src: dining1, category: "Dining", title: "Rooftop Ambience", span: "md:col-span-1 md:row-span-1" },
  { id: 3, src: heritage1, category: "Heritage", title: "Royal Architecture", span: "md:col-span-1 md:row-span-2" },
  { id: 4, src: exp1, category: "Experiences", title: "Cultural Nights", span: "md:col-span-2 md:row-span-1" },
  { id: 5, src: jod1, category: "Jodhpur", title: "The Blue City", span: "md:col-span-1 md:row-span-1" },
  { id: 6, src: room2, category: "Rooms", title: "Maharaja Chamber", span: "md:col-span-1 md:row-span-2" },
  { id: 7, src: dining2, category: "Dining", title: "Traditional Thali", span: "md:col-span-2 md:row-span-2" },
  { id: 8, src: jod2, category: "Jodhpur", title: "Toorji Ka Jhalra", span: "md:col-span-1 md:row-span-1" },
  { id: 9, src: heritage2, category: "Heritage", title: "Carved Jharokhas", span: "md:col-span-2 md:row-span-1" },
  { id: 10, src: exp2, category: "Experiences", title: "Fort Exploration", span: "md:col-span-1 md:row-span-2" },
  { id: 11, src: room3, category: "Rooms", title: "Rajwada Room", span: "md:col-span-1 md:row-span-1" },
  { id: 12, src: dining3, category: "Dining", title: "Sunset Dining", span: "md:col-span-2 md:row-span-1" },
  { id: 13, src: heritage3, category: "Heritage", title: "Lantern-lit Courtyard", span: "md:col-span-1 md:row-span-2" },
  { id: 14, src: exp3, category: "Experiences", title: "Desert Safari", span: "md:col-span-2 md:row-span-2" },
  { id: 15, src: jod3, category: "Jodhpur", title: "Bustling Bazaar", span: "md:col-span-1 md:row-span-1" },
];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { data: dbGallery } = useGallery();

  const galleryItems = useMemo(() => {
    if (dbGallery && dbGallery.length > 0) {
      return dbGallery.map((item, index) => ({
        id: item.id,
        src: item.image_url || initialGalleryItems[index % initialGalleryItems.length].src,
        category: (item.category as Category) || "Heritage",
        title: item.title || "Royal Frame",
        span: initialGalleryItems[index % initialGalleryItems.length].span,
      }));
    }
    return initialGalleryItems;
  }, [dbGallery]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    gsap.fromTo(
      ".gallery-item",
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" }
    );
  }, [activeCategory]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredItems.length));
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  return (
    <PageShell
      title="The Royal Gallery — Raj Mandir"
      description="Immerse yourself in the visual heritage, luxurious rooms, and unforgettable dining experiences of Raj Mandir Guest House."
    >
      <PageHero
        eyebrow="A VISUAL JOURNEY"
        title="Frames of"
        accent="Heritage"
        subtitle="A curated exhibition of our palace, our city, and the memories woven within."
        image={heroImg}
        alt="Palace corridor"
      />

      <section className="py-20 px-6 marble-texture min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.03),transparent_70%)] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 relative z-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-serif-sc tracking-[0.2em] text-[11px] px-6 py-3 transition-all duration-500 border ${
                  activeCategory === cat
                    ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_hsl(var(--gold)/0.2)]"
                    : "border-gold/20 text-muted-foreground hover:border-gold/60 hover:text-foreground"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-4 md:gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`gallery-item relative group overflow-hidden bg-card border border-gold/10 cursor-pointer ${item.span}`}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
                <img
                  src={item.src}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-20 pointer-events-none">
                  <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-1">{item.category.toUpperCase()}</div>
                  <h3 className="font-display text-2xl text-foreground">{item.title}</h3>
                </div>

                {/* Decorative Frame */}
                <div className="absolute inset-4 border border-gold/0 group-hover:border-gold/40 transition-colors duration-700 z-20 pointer-events-none scale-95 group-hover:scale-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-gold transition-colors z-50 p-2"
              aria-label="Close viewer"
            >
              <X size={32} />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length)); }}
              className="absolute left-6 text-muted-foreground hover:text-gold text-4xl hidden md:block z-50 transition-colors"
            >
              ‹
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredItems.length)); }}
              className="absolute right-6 text-muted-foreground hover:text-gold text-4xl hidden md:block z-50 transition-colors"
            >
              ›
            </button>

            <div 
              className="relative w-full max-w-6xl max-h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group max-h-[80vh] w-auto">
                <img
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl border border-gold/20"
                />
              </div>
              
              <div className="mt-8 text-center text-foreground w-full max-w-2xl bg-card/30 backdrop-blur-sm py-4 px-6 border border-gold/10">
                <div className="font-serif-sc text-gold tracking-widest text-xs mb-2">
                  {filteredItems[lightboxIndex].category.toUpperCase()}
                </div>
                <h3 className="font-display text-3xl mb-1">{filteredItems[lightboxIndex].title}</h3>
                <div className="text-muted-foreground font-serif italic text-sm">
                  {lightboxIndex + 1} of {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default GalleryPage;
