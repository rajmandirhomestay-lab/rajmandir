import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Users, BedDouble, Maximize, Eye, Sparkles, X } from "lucide-react";
import { PageShell } from "@/components/palace/PageShell";
import { DustParticles } from "@/components/palace/DustParticles";
import { ROOMS } from "@/data/rooms";
import { cn } from "@/lib/utils";
import { useRoomCategory, useRoomCategories } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const RoomDetail = () => {
  const { id = "" } = useParams();
  const { data: dbRoom, isLoading } = useRoomCategory(id);
  const { data: allRooms } = useRoomCategories();
  
  // Find a fallback from hardcoded to keep images/stories if missing in DB
  const fallbackRoom = ROOMS.find(r => r.id === id) || ROOMS[0];

  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const amenRef = useRef<HTMLDivElement>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const room = dbRoom ? {
    id: dbRoom.id,
    name: dbRoom.name,
    sanskrit: fallbackRoom.sanskrit,
    tagline: `Max Occupancy: ${dbRoom.occupancy} Guests`,
    story: dbRoom.description || fallbackRoom.story,
    price: Number(dbRoom.price),
    oldPrice: undefined,
    size: "48 sq.m",
    bed: "King Bed",
    view: "City View",
    adults: dbRoom.occupancy,
    children: 1,
    available: dbRoom.is_featured ? 5 : 0, 
    hero: dbRoom.image_url || fallbackRoom.hero,
    gallery: dbRoom.room_category_images?.length 
      ? dbRoom.room_category_images.map((img: any) => img.image_url)
      : fallbackRoom.gallery,
    highlights: ["Heritage Stay", "Butler Service", "Premium Amenities"],
    amenities: fallbackRoom.amenities
  } : fallbackRoom;

  useEffect(() => {
    if (isLoading || !room || !heroRef.current) return;
    const ctx = gsap.context(() => {
      // Hero
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroImgRef.current, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4 })
        .fromTo(".rd-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1.6")
        .fromTo(".rd-title > *", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.04 }, "-=0.8")
        .fromTo(".rd-meta", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, "-=0.5");

      gsap.to(heroImgRef.current, {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });

      // Gallery reveal
      gsap.from(".rd-gal-thumb", {
        scrollTrigger: { trigger: galleryRef.current, start: "top 75%" },
        y: 60, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out",
      });

      // Description
      gsap.from(".rd-desc-line", {
        scrollTrigger: { trigger: descRef.current, start: "top 75%" },
        y: 30, opacity: 0, duration: 1.1, stagger: 0.12, ease: "power3.out",
      });

      // Amenities
      gsap.from(".rd-amen", {
        scrollTrigger: { trigger: amenRef.current, start: "top 80%" },
        y: 50, opacity: 0, scale: 0.95, duration: 0.9, stagger: 0.06, ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, [dbRoom, fallbackRoom, isLoading, room]);

  if (isLoading) return <div className="min-h-screen bg-royal-deep flex items-center justify-center text-gold">Loading...</div>;
  if (!dbRoom && !fallbackRoom) return <Navigate to="/rooms" replace />;

  const related = allRooms 
    ? allRooms.filter(r => r.id !== id).slice(0, 2).map((r, i) => ({
        id: r.id,
        name: r.name,
        sanskrit: "कक्षा",
        tagline: `Occupancy: ${r.occupancy}`,
        price: Number(r.price),
        hero: r.image_url || ROOMS[i % ROOMS.length].hero
      }))
    : ROOMS.filter((r) => r.id !== id).slice(0, 2);

  return (
    <PageShell
      title={`${room.name} — Raj Mandir Guest House, Jodhpur`}
      description={`${room.tagline} ${room.story.slice(0, 110)}`}
    >
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100vh] w-full overflow-hidden flex items-end pt-32 pb-20">
        <div ref={heroImgRef} className="absolute inset-0 will-change-transform bg-black">
          <img src={room.hero} alt={`${room.name} cinematic view`} className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-royal-deep/60 via-royal-deep/30 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,hsl(var(--royal-deep)/0.9))]" />
        </div>
        <div className="absolute inset-0 light-rays opacity-50" aria-hidden />
        <DustParticles count={26} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="rd-eyebrow eyebrow mb-4">★ ROYAL CHAMBER · {room.sanskrit} ★</div>
          <h1 className="rd-title font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-ivory drop-shadow-[0_4px_30px_hsl(var(--royal-deep)/0.8)] max-w-4xl">
            {room.name.split(" ").map((w, wi) => (
              <span key={wi} className={cn("inline-block overflow-hidden align-bottom mr-3", wi === 1 && "italic text-gold-gradient")}>
                {w.split("").map((c, i) => (
                  <span key={i} className="inline-block">{c}</span>
                ))}
              </span>
            ))}
          </h1>
          <p className="rd-meta mt-6 font-serif italic text-xl md:text-2xl text-ivory max-w-2xl drop-shadow-md">{room.tagline}</p>

          <div className="rd-meta mt-10 inline-flex flex-wrap items-center gap-x-10 gap-y-6 bg-black/40 backdrop-blur-sm border border-gold/20 px-8 py-5 rounded-sm shadow-xl">
            <Stat icon={<Maximize size={20} />} k="SIZE" v={room.size} />
            <Stat icon={<BedDouble size={20} />} k="BED" v={room.bed} />
            <Stat icon={<Eye size={20} />} k="VIEW" v={room.view} />
            <Stat icon={<Users size={20} />} k="GUESTS" v={`${room.adults} adults · ${room.children} children`} />
          </div>

          <div className="rd-meta mt-8 flex flex-wrap items-center gap-4">
            <span className={cn(
              "px-4 py-2 font-serif-sc text-[10px] tracking-[0.4em] border",
              room.available <= 2
                ? "border-saffron text-saffron bg-saffron/10 animate-pulse"
                : "border-gold/60 text-gold bg-gold/10"
            )}>
              {room.available <= 2 ? `★ ONLY ${room.available} ROOM${room.available === 1 ? "" : "S"} LEFT ★` : "✦ AVAILABLE"}
            </span>
            <Link
              to={`/booking?room=${room.id}`}
              className="inline-flex items-center gap-3 font-serif-sc tracking-[0.3em] text-xs px-8 py-4 bg-gradient-gold text-royal-deep rounded-sm shadow-gold hover:scale-[1.03] transition-all duration-700"
            >
              RESERVE THIS CHAMBER <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section ref={galleryRef} className="relative py-24 px-6 marble-texture overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mb-3">★ THE GALLERY ★</div>
            <h2 className="font-display text-4xl md:text-5xl">Glimpses of the <span className="italic text-gold-gradient">Chamber</span></h2>
            <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold">❖</span></div>
          </div>

          {/* Featured image */}
          <div className="rd-gal-thumb relative w-full max-w-5xl mx-auto h-[50vh] md:h-[65vh] jharokha-frame mb-8 bg-black/40 overflow-hidden cursor-zoom-in group" onClick={() => setLightbox(activeImg)}>
            {/* Blurry background wrapper to maintain aspect ratio/frame filling */}
            <img src={room.gallery[activeImg]} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 transition-all duration-1000" key={`bg-${activeImg}`} />
            
            {/* Sharp foreground image */}
            <img src={room.gallery[activeImg]} alt={`${room.name} feature ${activeImg + 1}`} className="absolute inset-0 w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" key={activeImg} />
            
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 to-transparent pointer-events-none" />
          </div>

          {/* Thumbnail strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {room.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "rd-gal-thumb relative aspect-[4/5] overflow-hidden jharokha-frame transition-all duration-700 hover:-translate-y-1",
                  activeImg === i ? "ring-2 ring-gold shadow-gold scale-[1.02]" : "opacity-70 hover:opacity-100"
                )}
              >
                <img src={src} alt={`${room.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIPTION + HIGHLIGHTS */}
      <section ref={descRef} className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 stone-texture" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="rd-desc-line eyebrow mb-3">★ THE STORY OF THIS ROOM ★</div>
          <h2 className="rd-desc-line font-display text-4xl md:text-5xl mb-8">A chamber, <span className="italic text-gold-gradient">a memory</span></h2>
          <div className="rd-desc-line divider-gold max-w-md mx-auto mb-10"><span className="text-gold">❖</span></div>
          <p className="rd-desc-line font-serif text-xl md:text-2xl leading-relaxed text-foreground/85 italic">{room.story}</p>

          <ul className="mt-14 grid md:grid-cols-3 gap-6 text-left">
            {room.highlights.map((h, i) => (
              <li key={i} className="rd-desc-line relative p-6 bg-card/60 backdrop-blur-sm border border-gold/30 jharokha-frame">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-background text-gold font-display">✦</span>
                <p className="font-serif italic text-lg text-foreground/85 mt-2">{h}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CAPACITY */}
      <section className="relative py-20 px-6 bg-gradient-night text-ivory overflow-hidden">
        <div className="absolute inset-0 lattice-pattern opacity-10" />
        <div className="relative max-w-5xl mx-auto grid md:grid-cols-3 gap-10 items-center">
          <CapacityCard label="ADULTS" count={room.adults} sub="comfortable" />
          <CapacityCard label="CHILDREN" count={room.children} sub="under 12" />
          <CapacityCard label="EXTRA BED" count={1} sub="on request · ₹2,500" />
        </div>
      </section>

      {/* AMENITIES */}
      <section ref={amenRef} className="relative py-24 px-6 marble-texture">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">★ PALACE AMENITIES ★</div>
            <h2 className="font-display text-4xl md:text-5xl">Every comfort, <span className="italic text-gold-gradient">royally arranged</span></h2>
            <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold">❖</span></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {room.amenities.map((a, i) => (
              <div key={i} className="rd-amen group relative p-7 bg-card/60 backdrop-blur-sm border border-gold/25 hover:border-gold transition-all duration-700 hover:-translate-y-1 hover:shadow-gold">
                <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold" />
                <div className="text-3xl text-gold-gradient mb-3 group-hover:scale-110 transition-transform duration-700">{a.icon}</div>
                <div className="font-display text-lg text-foreground">{a.label}</div>
                <div className="font-serif italic text-sm text-muted-foreground mt-1">{a.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING + BOOK CTA */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 marble-texture" />
        <div className="relative max-w-4xl mx-auto">
          <div className="relative p-10 md:p-14 bg-card/70 backdrop-blur-md border border-gold/40 shadow-frame text-center">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />

            <div className="eyebrow mb-3">★ CHAMBER TARIFF ★</div>
            <h3 className="font-display text-3xl mb-6">From the Royal Ledger</h3>

            <div className="flex items-baseline justify-center gap-4 my-6">
              {room.oldPrice && (
                <span className="font-serif italic text-2xl text-muted-foreground line-through">₹ {room.oldPrice.toLocaleString("en-IN")}</span>
              )}
              <span className="font-display text-6xl md:text-7xl text-gold-gradient">₹ {room.price.toLocaleString("en-IN")}</span>
            </div>
            <div className="font-serif-sc text-[11px] tracking-[0.4em] text-muted-foreground">PER NIGHT · TAXES INCLUSIVE</div>

            {room.oldPrice && (
              <div className="inline-block mt-6 px-4 py-2 border border-saffron text-saffron font-serif-sc text-[10px] tracking-[0.3em] bg-saffron/10">
                ★ HERITAGE OFFER · SAVE ₹{(room.oldPrice - room.price).toLocaleString("en-IN")} ★
              </div>
            )}

            <div className="divider-gold max-w-md mx-auto my-8"><span className="text-gold">❖</span></div>

            <Link
              to={`/booking?room=${room.id}`}
              className="inline-flex items-center gap-3 font-serif-sc tracking-[0.3em] text-xs px-10 py-5 bg-gradient-gold text-royal-deep rounded-sm shadow-gold hover:scale-[1.03] transition-all duration-700"
            >
              <Sparkles size={16} /> RESERVE THIS CHAMBER <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* RELATED ROOMS */}
      <section className="relative py-24 px-6 bg-gradient-night text-ivory overflow-hidden">
        <div className="absolute inset-0 lattice-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">★ OTHER CHAMBERS ★</div>
            <h2 className="font-display text-4xl md:text-5xl text-ivory">Continue your <span className="italic text-gold-gradient">palace tour</span></h2>
            <div className="divider-gold mt-6 max-w-md mx-auto"><span className="text-gold">❖</span></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {related.map((r) => (
              <Link key={r.id} to={`/rooms/${r.id}`} className="group relative block jharokha-frame overflow-hidden hover:-translate-y-2 transition-all duration-700 hover:shadow-gold">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={r.hero} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-deep via-royal-deep/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="font-serif-sc text-gold tracking-[0.3em] text-[10px] mb-2">{r.sanskrit}</div>
                  <div className="font-display text-3xl text-ivory">{r.name}</div>
                  <div className="font-serif italic text-ivory/70 mt-1">{r.tagline}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-2xl text-gold-gradient">₹ {r.price.toLocaleString("en-IN")}</span>
                    <span className="font-serif-sc text-[10px] tracking-[0.3em] text-gold flex items-center gap-2 group-hover:gap-4 transition-all">
                      DISCOVER <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-royal-deep/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-ivory/70 hover:text-gold transition-colors" onClick={() => setLightbox(null)}><X size={28} /></button>
          <button className="absolute left-6 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-gold" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + room.gallery.length) % room.gallery.length); }}>
            <ChevronLeft size={36} />
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-gold" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % room.gallery.length); }}>
            <ChevronRight size={36} />
          </button>
          <img src={room.gallery[lightbox]} alt={`${room.name} expanded ${lightbox + 1}`} className="max-h-[85vh] max-w-[90vw] object-contain shadow-gold" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </PageShell>
  );
};

const Stat = ({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) => (
  <div className="flex items-center gap-4">
    <span className="text-gold drop-shadow-md">{icon}</span>
    <div>
      <div className="font-serif-sc text-[11px] tracking-[0.3em] font-semibold text-gold mb-1 drop-shadow-sm">{k}</div>
      <div className="font-serif italic text-lg text-ivory drop-shadow-sm">{v}</div>
    </div>
  </div>
);

const CapacityCard = ({ label, count, sub }: { label: string; count: number; sub: string }) => (
  <div className="text-center p-8 bg-card/10 backdrop-blur-sm border border-gold/30">
    <div className="font-display text-7xl text-gold-gradient">{count}</div>
    <div className="eyebrow mt-3">★ {label} ★</div>
    <div className="font-serif italic text-ivory/70 mt-2">{sub}</div>
  </div>
);

export default RoomDetail;
