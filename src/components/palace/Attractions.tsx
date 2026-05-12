import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Clock, Navigation } from "lucide-react";
import fortImg from "@/assets/exp-fort.jpg";
import jaswantImg from "@/assets/gallery-1.jpg";
import palaceImg from "@/assets/palace-hero.jpg";
import clockImg from "@/assets/story-bazaar.jpg";
import desertImg from "@/assets/exp-safari.jpg";

gsap.registerPlugin(ScrollTrigger);

const attractions = [
  {
    id: "mehrangarh",
    name: "Mehrangarh Fort",
    distance: "1.2 km",
    time: "15 min walk",
    desc: "One of the largest forts in India, offering spectacular views of the Blue City.",
    image: fortImg,
  },
  {
    id: "jaswant",
    name: "Jaswant Thada",
    distance: "1.8 km",
    time: "10 min drive",
    desc: "A beautifully carved white marble cenotaph, often called the Taj Mahal of Marwar.",
    image: jaswantImg,
  },
  {
    id: "clock-tower",
    name: "Clock Tower & Sardar Market",
    distance: "800 m",
    time: "10 min walk",
    desc: "The bustling heart of the city, perfect for spices, textiles, and local street food.",
    image: clockImg,
  },
  {
    id: "umaid",
    name: "Umaid Bhawan Palace",
    distance: "6.5 km",
    time: "20 min drive",
    desc: "A magnificent piece of Rajasthan's heritage and one of the world's largest private residences.",
    image: palaceImg,
  },
  {
    id: "desert",
    name: "Desert Safari Point",
    distance: "12 km",
    time: "30 min drive",
    desc: "The gateway to the Thar desert for sunset camel rides and Bishnoi village tours.",
    image: desertImg,
  },
];

export const Attractions = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".attraction-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 bg-background relative overflow-hidden border-t border-gold/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--gold)/0.03),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">★ BEYOND THE PALACE ★</div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            Nearby <span className="text-gold-gradient italic">Attractions</span>
          </h2>
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
          <p className="font-serif text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Situated at the foot of Mehrangarh Fort, Raj Mandir places you at the epicenter of Jodhpur's history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((item) => (
            <div key={item.id} className="attraction-card group relative bg-card border border-gold/20 shadow-frame hover:shadow-gold hover:border-gold/50 transition-all duration-700 overflow-hidden flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors duration-500">{item.name}</h3>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex gap-4 mb-4 pb-4 border-b border-gold/10">
                  <div className="flex items-center gap-1.5 font-serif-sc text-[10px] tracking-widest text-muted-foreground">
                    <Navigation size={12} className="text-gold" /> {item.distance}
                  </div>
                  <div className="flex items-center gap-1.5 font-serif-sc text-[10px] tracking-widest text-muted-foreground">
                    <Clock size={12} className="text-gold" /> {item.time}
                  </div>
                </div>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-6 pt-4 text-right mt-auto">
                  <span className="font-serif-sc text-[10px] tracking-[0.2em] text-gold hover:text-gold-glow cursor-pointer transition-colors">
                    GET DIRECTIONS →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Interactive Map UI Placeholder Card */}
          <div className="attraction-card relative bg-royal-deep border border-gold/40 shadow-gold overflow-hidden flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${fortImg})`, backgroundSize: 'cover', filter: 'sepia(1)' }} />
            <div className="absolute inset-0 bg-royal-deep/80" />
            <div className="absolute inset-4 border border-gold/20" />
            
            <MapPin size={48} className="text-gold mb-6 relative z-10 animate-pulse" />
            <h3 className="font-display text-3xl text-gold mb-4 relative z-10">Explore the Map</h3>
            <p className="font-serif text-ivory/70 text-sm mb-6 relative z-10 max-w-xs">
              View our curated heritage trails and navigation routes through the Blue City.
            </p>
            <button className="relative z-10 font-serif-sc tracking-widest text-xs border border-gold px-6 py-3 text-gold hover:bg-gold hover:text-royal-deep transition-all duration-500">
              OPEN ROYAL MAP
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
