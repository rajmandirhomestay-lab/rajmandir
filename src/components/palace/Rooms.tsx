import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import maharaja from "@/assets/room-maharaja.jpg";
import rajwada from "@/assets/room-rajwada.jpg";
import haveli from "@/assets/room-haveli.jpg";
import { useRoomCategories } from "@/lib/api";

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
  const { data: dbRooms } = useRoomCategories();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRooms = dbRooms && dbRooms.length > 0
    ? dbRooms.map((r, i) => ({
          id: r.id,
          name: r.name,
          sanskrit: r.name.includes("Maharaja") ? "महाराजा" : r.name.includes("Rajwada") ? "राजवाड़ा" : "हवेली",
          img: r.image_url || rooms[i % rooms.length].img,
          desc: r.description || rooms[i % rooms.length].desc,
          price: `₹ ${Number(r.price).toLocaleString('en-IN')}`,
        }))
    : rooms.map((r, i) => ({ ...r, id: `hardcoded-${i}` }));

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % activeRooms.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + activeRooms.length) % activeRooms.length);
  const goToSlide = (index: number) => setActiveIndex(index);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [activeRooms.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".rooms-eyebrow > *", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
      });
      gsap.from(".slider-container", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        y: 60,
        opacity: 0,
        duration: 1.6,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="rooms" ref={sectionRef} className="relative py-32 overflow-hidden bg-royal-deep">
      {/* Background ambient light & texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 stone-texture opacity-30 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24 rooms-eyebrow">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs mb-4 uppercase">★ The Chambers ★</div>
          <h2 className="font-display text-5xl md:text-7xl text-ivory">
            Royal <span className="text-gold-gradient italic">Quarters</span>
          </h2>
          <div className="divider-gold max-w-md mx-auto mt-6">
            <span className="font-display text-gold text-xl">❖</span>
          </div>
          <p className="mt-6 font-serif italic text-xl text-ivory/70 max-w-2xl mx-auto">
            Sanctuaries of silence — each a different verse from the same royal poem.
          </p>
        </div>

        {/* Cinematic Slider */}
        <div className="slider-container relative h-[550px] md:h-[650px] lg:h-[750px] flex justify-center items-center w-full mt-10 perspective-[1200px]">
          {activeRooms.map((r, i) => {
            const len = activeRooms.length;
            let offset = (i - activeIndex) % len;
            if (offset < 0) offset += len;

            const isActive = offset === 0;
            const isNext = offset === 1 || (len === 2 && offset === 1);
            const isPrev = offset === len - 1;
            const isHidden = !isActive && !isNext && !isPrev;

            let transformClasses = "";
            if (isActive) transformClasses = "translate-x-0 scale-100 z-30 opacity-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]";
            else if (isNext) transformClasses = "translate-x-[55%] md:translate-x-[45%] lg:translate-x-[50%] xl:translate-x-[60%] scale-[0.85] z-20 opacity-50 hover:opacity-75 blur-[2px] hover:blur-none";
            else if (isPrev) transformClasses = "-translate-x-[55%] md:-translate-x-[45%] lg:-translate-x-[50%] xl:-translate-x-[60%] scale-[0.85] z-20 opacity-50 hover:opacity-75 blur-[2px] hover:blur-none";
            else transformClasses = "translate-x-0 scale-75 z-10 opacity-0 pointer-events-none";

            return (
              <article 
                key={r.id} 
                className={`absolute top-0 h-full w-[85%] md:w-[65%] lg:w-[50%] xl:w-[40%] max-w-[500px] transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-center ${transformClasses} ${isActive ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => {
                  if (isNext) nextSlide();
                  if (isPrev) prevSlide();
                }}
              >
                <div className={`w-full h-full jharokha-frame bg-royal-deep relative overflow-hidden flex flex-col justify-end group ${isActive ? 'ring-1 ring-gold/40 shadow-[0_0_50px_rgba(212,175,55,0.15)] glow-hover' : 'ring-1 ring-gold/10'}`}>
                  {/* Image */}
                  <img
                    src={r.img}
                    alt={`${r.name} chamber`}
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[4000ms] ease-out ${isActive ? 'scale-105 group-hover:scale-110' : 'scale-100'}`}
                  />
                  
                  {/* Gradients for depth and readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-royal-deep/30 via-royal-deep/10 to-royal-deep/95" />
                  
                  {/* Content (only fully visible on active) */}
                  <div className={`relative z-10 p-6 md:p-10 transition-all duration-[1200ms] delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="font-serif-sc text-gold text-[10px] md:text-xs tracking-[0.4em] uppercase">{r.sanskrit}</div>
                      {i === 0 && <span className="px-2 py-0.5 border border-gold/40 text-gold text-[8px] tracking-widest bg-royal-deep/50 backdrop-blur-md">SIGNATURE</span>}
                    </div>
                    
                    <h3 className="font-display text-4xl md:text-5xl text-ivory mb-4 leading-tight">{r.name}</h3>
                    <p className="font-serif italic text-ivory/80 text-sm md:text-base leading-relaxed mb-8 line-clamp-2 pr-4">{r.desc}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-gold/20 pt-6">
                      <div>
                        <div className="font-serif-sc text-gold/70 tracking-[0.2em] text-[9px] mb-1">STARTING FROM</div>
                        <div className="font-display text-2xl md:text-3xl text-gold-gradient">{r.price}</div>
                        <div className="font-serif-sc text-[10px] tracking-[0.3em] text-ivory/60 mt-1">/ NIGHT</div>
                      </div>
                      <a
                        href={`/rooms`}
                        className="group/btn relative overflow-hidden inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold transition-all duration-500 backdrop-blur-md"
                      >
                        <span className="relative z-10 font-serif-sc tracking-[0.3em] text-[10px] md:text-xs">VIEW CHAMBER</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      </a>
                    </div>
                  </div>

                  {/* Non-active overlay label */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-[1000ms] ${!isActive && !isHidden ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     <div className="px-6 py-3 bg-royal-deep/80 backdrop-blur-md border border-gold/30 text-gold font-serif-sc tracking-widest text-xs scale-90 group-hover:scale-100 transition-transform">
                       VIEW {r.name.split(' ')[0].toUpperCase()}
                     </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mt-12 md:mt-20 relative z-20">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-royal-deep transition-all duration-500 group backdrop-blur-sm"
            aria-label="Previous Chamber"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-3">
            {activeRooms.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`transition-all duration-500 rounded-full ${i === activeIndex ? 'w-10 h-2 bg-gold' : 'w-2 h-2 bg-gold/30 hover:bg-gold/60'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-royal-deep transition-all duration-500 group backdrop-blur-sm"
            aria-label="Next Chamber"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
