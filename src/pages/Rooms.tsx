import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { useRoomCategories, useHomepageSections } from "@/lib/api";
import heroImgFallback from "@/assets/page-rooms-hero.jpg";
import maharaja from "@/assets/room-maharaja.jpg";
import rajwada from "@/assets/room-rajwada.jpg";
import haveli from "@/assets/room-haveli.jpg";
import about from "@/assets/about-palace.jpg";

gsap.registerPlugin(ScrollTrigger);

const chambers = [
  {
    name: "Maharaja Suite",
    sanskrit: "महाराजा",
    img: maharaja,
    foreground: about,
    price: "₹ 14,500",
    tagline: "The chamber of kings.",
    story:
      "A canopied four-poster of carved sheesham presides beneath a frescoed ceiling of lapis and gold. Brass lanterns cast slow shadows; the desert wind enters through three jharokha balconies that have watched over Jodhpur for one hundred and thirty winters.",
    details: ["72 sq.m · Private terrace", "King bed · Antique writing desk", "Marble bath · Copper tub", "Butler on call · Curated mini-bar"],
    slug: "maharaja-suite",
  },
  {
    name: "Rajwada Chamber",
    sanskrit: "राजवाड़ा",
    img: rajwada,
    foreground: maharaja,
    price: "₹ 9,800",
    tagline: "Of indigo rooftops and morning light.",
    story:
      "Indigo walls washed by hand, a low divan layered in bandhani silk, and jharokha windows that frame the blue rooftops of the old city. Wake to temple bells; sleep to the call of a peacock from the courtyard below.",
    details: ["48 sq.m · Jharokha alcove", "Queen bed · Hand-painted ceiling", "Marble bath", "Heritage breakfast"],
    slug: "rajwada-chamber",
  },
  {
    name: "Haveli Courtyard",
    sanskrit: "हवेली",
    img: haveli,
    foreground: rajwada,
    price: "₹ 7,200",
    tagline: "Where the fountain still sings.",
    story:
      "A ground-floor sanctuary opening onto the inner courtyard — heirloom carpets, a quiet fountain at its centre, and a private veranda screened by carved sandstone jali. The painted ceiling above is original, restored leaf by leaf.",
    details: ["38 sq.m · Courtyard veranda", "Twin or queen", "Sandstone bath", "Yoga at dawn"],
    slug: "haveli-courtyard",
  },
];

const RoomBlock = ({ room, index }: { room: typeof chambers[number]; index: number }) => {
  const ref = useRef<HTMLElement>(null);
  const reverse = index % 2 === 1;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: ref.current, start: "top 70%" };
      gsap.from(".rb-bg", { ...trig, scale: 1.15, opacity: 0, duration: 1.8, ease: "power3.out" } as any);
      gsap.from(".rb-fg", { ...trig, y: 80, opacity: 0, duration: 1.6, ease: "power3.out" } as any);
      gsap.from(".rb-text > *", { ...trig, y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" } as any);
      gsap.to(".rb-bg", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative min-h-[110vh] py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 marble-texture" />
      <div className={`relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center ${reverse ? "" : ""}`}>
        {/* Imagery (background + floating foreground) */}
        <div className={`relative lg:col-span-7 h-[80vh] ${reverse ? "lg:order-2" : ""}`}>
          <div className="rb-bg absolute inset-0 jharokha-frame">
            <img src={room.img} alt={`${room.name} — full chamber view`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" width={1024} height={1280} />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 via-transparent to-transparent" />
          </div>
          <div className={`rb-fg absolute ${reverse ? "-left-6 -bottom-10" : "-right-6 -bottom-10"} hidden md:block w-[42%] aspect-[3/4] jharokha-frame shadow-royal`}>
            <img src={room.foreground} alt={`${room.name} detail`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <DustParticles count={14} />
        </div>

        {/* Story column */}
        <div className={`relative lg:col-span-5 rb-text ${reverse ? "lg:order-1 lg:pr-10" : "lg:pl-10"}`}>
          <div className="eyebrow mb-3">CHAMBER · {String(index + 1).padStart(2, "0")}</div>
          <div className="font-serif-sc text-gold text-[10px] tracking-[0.4em] mb-2">{room.sanskrit}</div>
          <h2 className="font-display text-5xl md:text-6xl leading-tight">
            {room.name.split(" ")[0]} <span className="text-gold-gradient italic">{room.name.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="mt-5 font-serif italic text-xl text-muted-foreground">{room.tagline}</p>
          <div className="divider-gold mt-6 max-w-xs">
            <span className="text-gold">❖</span>
          </div>
          <p className="mt-6 font-serif text-lg leading-relaxed text-foreground/85">{room.story}</p>

          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.details.map((d) => (
              <li key={d} className="flex items-start gap-3 font-serif-sc text-[11px] tracking-[0.2em] text-foreground/70">
                <span className="text-gold mt-[2px]">✦</span> {d}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-6">
            <div>
              <div className="font-display text-3xl text-gold-gradient">{room.price}</div>
              <div className="font-serif-sc text-[10px] tracking-[0.3em] text-muted-foreground">PER NIGHT</div>
            </div>
            <a href={`/rooms/${room.slug || room.name.toLowerCase().split(" ")[0].replace("haveli","haveli")}`} className="inline-block font-serif-sc tracking-[0.3em] text-xs px-7 py-4 bg-gradient-gold text-royal-deep rounded-sm hover:shadow-gold transition-all duration-700">
              VIEW CHAMBER
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const RoomsPage = () => {
  const { data: dbRooms, isLoading } = useRoomCategories();
  const { data: sections } = useHomepageSections();

  const roomsSection = sections?.find(s => s.section_key === 'rooms');
  const heroImg = roomsSection?.content?.image_url || heroImgFallback;

  const activeChambers = dbRooms && dbRooms.length > 0 
    ? dbRooms.map((dbRoom, i) => {
        const match = chambers[i % chambers.length];
        return {
          name: dbRoom.name,
          sanskrit: dbRoom.name.includes("Maharaja") ? "महाराजा" : dbRoom.name.includes("Rajwada") ? "राजवाड़ा" : "हवेली",
          img: dbRoom.image_url || match.img,
          foreground: dbRoom.hover_image_url || match.foreground,
          price: `₹ ${Number(dbRoom.price).toLocaleString('en-IN')}`,
          tagline: dbRoom.is_featured ? "Signature Chamber" : "Palace Chamber",
          story: dbRoom.description || match.story,
          details: ["Heritage Interior", `${dbRoom.occupancy} Guests Capacity`, "Marble En-suite", "Luxury Amenities"],
          slug: dbRoom.id
        };
      })
    : chambers;

  return (
    <PageShell
      title="Royal Chambers — Raj Mandir Guest House, Jodhpur"
      description="Step inside the royal chambers of Raj Mandir — Maharaja Suite, Rajwada Chamber and Haveli Courtyard. Heritage rooms with jharokha views in old Jodhpur."
    >
      <PageHero
        eyebrow="THE CHAMBERS"
        title="Royal"
        accent="Quarters"
        subtitle="Sanctuaries — each a different verse from the same royal poem."
        image={heroImg}
        alt="Frescoed royal bedchamber of Raj Mandir Guest House at golden hour"
      />
      {activeChambers.map((r, i) => (
        <RoomBlock key={r.name} room={r} index={i} />
      ))}
    </PageShell>
  );
};

export default RoomsPage;
