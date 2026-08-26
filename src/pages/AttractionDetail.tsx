import { useParams, Link } from "react-router-dom";
import { useAttraction, useAttractions } from "@/lib/api";
import { PageShell } from "@/components/palace/PageShell";
import { MapPin, Phone, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import heroImgFallback from "@/assets/story-bluecity.jpg";
import fortImg from "@/assets/exp-fort.jpg";
import jaswantImg from "@/assets/gallery-1.jpg";
import palaceImg from "@/assets/palace-hero.jpg";
import clockImg from "@/assets/story-bazaar.jpg";

// Pre-configured rich fallbacks for famous Jodhpur wonders matching Rani Mahal style
const fallbackWonders: Record<string, any> = {
  "blue-city": {
    id: "blue-city",
    title: "Blue City",
    tagline: "The Indigo Lanes Below The Fort",
    eyebrow: "OUR ADDRESS FROM RAJ MANDIR",
    full_description: `The Rani Mahal sits at the heart of Navchokiya — the oldest quarter of Jodhpur's walled city, directly on the slopes below Mehrangarh Fort. The lanes here are some of the most photogenic in Rajasthan: narrow, winding, and lined with houses painted in distinctive indigo blue.

The blue was traditionally associated with the Brahmin community but spread across caste lines over generations. Today it is as much a cooling measure as a cultural marker — the indigo pigment reduces interior heat by several degrees in the summer months. Walking these lanes at dawn, before the city wakes, is an experience that no heritage site visit can replicate.`,
    architecture_text: `The architecture of Navchokiya tells a social history of the old city. The carved jharokha window screens allowed women to observe the street without being seen — their intricacy signals the wealth and status of the family inside. Many of these windows date to the 17th and 18th century and have survived intact. Ask at the guest house front desk for a walking map. A family member can occasionally accompany guests on a 45-minute orientation walk through the lanes.`,
    tips: [
      "Dawn and dusk are the best light for the blue lanes — the colour is most intense in low sun",
      "The area is best explored on foot — vehicles can't navigate most lanes",
      "Keep a lookout for carved jharokha windows — many date to the 17th and 18th century"
    ],
    image: heroImgFallback,
    location: "Navchokiya, Old City"
  },
  "mehrangarh": {
    id: "mehrangarh",
    title: "Mehrangarh Fort",
    tagline: "The Citadel of the Sun",
    eyebrow: "JODHPUR'S CROWNING MONUMENT",
    full_description: `Rising perpendicular and impregnable 400 feet above Jodhpur's skyline, Mehrangarh Fort is one of the largest and most magnificent forts in India. Built around 1459 by Rao Jodha, the fort is enclosed by imposing thick walls containing palaces known for intricate carvings and expansive courtyards.

From the ramparts, you gain a panoramic vista over the sprawling indigo blue rooftops of Navchokiya. The museum inside houses a priceless collection of royal palanquins, turbans, arms, and period rooms preserved in authentic splendor.`,
    architecture_text: `The fort features seven grand entry gates built by successive rulers to commemorate military victories. Inside, the Moti Mahal (Pearl Palace), Phool Mahal (Flower Palace), and Sheesh Mahal (Mirror Palace) showcase exquisite Rajput architectural artistry with delicate stained glass windows and gilded ceilings.`,
    tips: [
      "Visit early in the morning to beat the crowds and heat",
      "Rent an audio guide at the entrance — it is acclaimed as one of the best in Asia",
      "Don't miss the elevator service to the upper battlements for sunrise view"
    ],
    image: fortImg,
    location: "1.2 km from Raj Mandir"
  },
  "jaswant-thada": {
    id: "jaswant-thada",
    title: "Jaswant Thada",
    tagline: "The Taj Mahal of Marwar",
    eyebrow: "ROYAL CENOTAPH OF MARWAR",
    full_description: `Built in 1899 by Maharaja Sardar Singh in memory of his father Maharaja Jaswant Singh II, this marble cenotaph is an architectural masterpiece of tranquil grandeur. The structure is built out of intricately carved sheets of pure white marble.

The marble sheets are extremely thin and polished so that they emit a warm golden glow when illuminated by the bright desert sunlight. The grounds feature tiered gardens, carved gazebos, and a serene lake.`,
    architecture_text: `Designed in classical Rajput architecture with Mughal influences, Jaswant Thada features delicate carved jharokhas, carved pillars, and memorial tablets of Marwar rulers. A peaceful sanctuary away from the hustle of the market.`,
    tips: [
      "Late afternoon light provides glowing golden photography angles of the marble",
      "Listen for local musicians playing classical Rajasthani folk instruments near the steps",
      "Combines perfectly with a visit to Mehrangarh Fort nearby"
    ],
    image: jaswantImg,
    location: "1.8 km from Raj Mandir"
  },
  "clock-tower": {
    id: "clock-tower",
    title: "Clock Tower & Sardar Market",
    tagline: "The Vibrant Heart of Marwar",
    eyebrow: "SPICE MARKET & HERITAGE BAZAAR",
    full_description: `Sardar Market is a bustling heritage bazaar surrounding the iconic Ghanta Ghar (Clock Tower) constructed during Maharaja Sardar Singh's reign. The market is packed with over 7,000 tiny shops selling Mathaniya red chillies, fragrant teas, handcrafted leather shoes (mojris), silver jewelry, and traditional Rajasthani textiles.

Walking through Sardar Market gives an authentic sensory immersion into the colors, aromas, and sounds of old Jodhpur.`,
    architecture_text: `The imposing central Clock Tower was built between 1880 and 1911 in Victorian-Rajput fusion style. Clockwork mechanisms were imported from London and remain fully operational today.`,
    tips: [
      "Try local Makhaniya Lassi and Mirchi Bada at the market gate",
      "Bargaining is expected for handicraft and textile shopping",
      "Busiest between 4:00 PM and 8:00 PM when evening lights illuminate the tower"
    ],
    image: clockImg,
    location: "800 m from Raj Mandir"
  },
  "umaid-bhawan": {
    id: "umaid-bhawan",
    title: "Umaid Bhawan Palace",
    tagline: "A Royal 20th Century Marvel",
    eyebrow: "ONE OF THE WORLD'S LARGEST RESIDENCES",
    full_description: `Perched high on Chittar Hill, Umaid Bhawan Palace is one of the world's largest private residences. Built between 1928 and 1943 during the reign of Maharaja Umaid Singh, it was commissioned to provide employment to farmers during a severe drought.

Constructed using golden-yellow sandstone held together without mortar, it blends Art Deco and traditional Indo-Saracenic architectural styles.`,
    architecture_text: `Designed by famous British architect Henry Vaughan Lanchester, the palace features a central dome rising 105 feet, lavish marble interiors, and an impressive vintage car display museum on the royal grounds.`,
    tips: [
      "Visit the royal museum section to view antique clocks and royal artifacts",
      "The exterior gardens offer stunning photography angles of the golden sandstone palace",
      "Prior reservation is mandatory for dining at the palace restaurants"
    ],
    image: palaceImg,
    location: "6.5 km from Raj Mandir"
  }
};

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: dbAttraction, isLoading } = useAttraction(id || "");
  const { data: allAttractions } = useAttractions();

  // Combine DB data with pre-configured fallback data for rich rendering
  const key = id ? id.toLowerCase().replace(/[^a-z0-9]+/g, '-') : "";
  const fallback = fallbackWonders[key] || fallbackWonders["blue-city"];

  const attraction = dbAttraction ? {
    id: dbAttraction.id,
    title: dbAttraction.title || fallback.title,
    tagline: dbAttraction.subtitle || dbAttraction.tagline || fallback.tagline,
    eyebrow: dbAttraction.eyebrow || fallback.eyebrow,
    full_description: dbAttraction.full_description || dbAttraction.short_description || fallback.full_description,
    architecture_text: dbAttraction.architecture_text || fallback.architecture_text,
    tips: dbAttraction.tips ? (Array.isArray(dbAttraction.tips) ? dbAttraction.tips : String(dbAttraction.tips).split('\n').filter(Boolean)) : fallback.tips,
    image: dbAttraction.attraction_images?.[0]?.image_url || dbAttraction.images?.[0] || fallback.image,
    location: dbAttraction.location || fallback.location
  } : fallback;

  // List of attractions for sidebar and next/prev pagination
  const attractionList = (allAttractions && allAttractions.length > 0) 
    ? allAttractions 
    : Object.values(fallbackWonders);

  const currentIndex = attractionList.findIndex((item: any) => 
    item.id === id || item.slug === id || item.title?.toLowerCase() === attraction.title?.toLowerCase()
  );
  
  const prevAttraction = attractionList[currentIndex > 0 ? currentIndex - 1 : attractionList.length - 1];
  const nextAttraction = attractionList[currentIndex < attractionList.length - 1 ? currentIndex + 1 : 0];

  return (
    <PageShell title={`${attraction.title} — Raj Mandir Homestay Jodhpur`} description={attraction.tagline}>
      {/* Detail Page Hero Banner - Rani Mahal Sky Blue Aesthetic */}
      <div className="relative min-h-screen w-full flex items-center justify-center pt-36 pb-24 px-6 bg-slate-900 text-center overflow-hidden border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-100 filter brightness-90 contrast-[1.05]"
          style={{ backgroundImage: `url(${attraction.image})` }}
        />
        {/* Clean subtle dark overlay for crisp text readability without bottom white fade effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs sm:text-sm uppercase mb-4 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {attraction.eyebrow || "OUR ADDRESS FROM RAJ MANDIR"}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold mb-4 drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
            {attraction.title}
          </h1>
          {attraction.tagline && (
            <div className="font-serif italic text-gold-glow text-lg sm:text-2xl tracking-wider uppercase font-semibold drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {attraction.tagline}
            </div>
          )}
          <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-xl">❖</span></div>
        </div>
      </div>

      {/* Main Content Area: 2 Columns (Left Story, Right Sticky Sidebar) */}
      <div className="bg-background relative py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Story & Visiting Details */}
          <div className="lg:col-span-7 space-y-10 text-foreground">
            
            {/* Story Paragraphs */}
            <div className="space-y-6 font-serif text-lg leading-relaxed text-foreground/90 font-normal">
              {attraction.full_description.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Architectural / Historical Highlight Section */}
            {attraction.architecture_text && (
              <div className="pt-6 border-t border-gold/20 space-y-4">
                <p className="font-serif text-lg leading-relaxed text-foreground/90">
                  {attraction.architecture_text}
                </p>
              </div>
            )}

            {/* Tips for Visiting Section */}
            {attraction.tips && attraction.tips.length > 0 && (
              <div className="pt-8 border-t border-gold/20">
                <h3 className="font-display text-2xl text-foreground mb-6 font-semibold">Tips for Visiting</h3>
                <ul className="space-y-4">
                  {attraction.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 font-serif text-base text-foreground/80 leading-relaxed">
                      <span className="text-gold font-bold select-none text-lg">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar Cards */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-28 space-y-8">
              
              {/* Card 1: Staying in Jodhpur? */}
              <div className="bg-royal-deep text-white p-8 border border-gold/40 shadow-royal rounded-sm space-y-6">
                <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] uppercase font-bold">
                  STAYING IN JODHPUR?
                </div>
                <h4 className="font-display text-3xl text-white font-bold leading-tight">
                  Raj Mandir Homestay
                </h4>
                <p className="font-serif text-sm text-ivory/80 leading-relaxed italic">
                  A 19th-century heritage guest house in Navchokiya — the old city's oldest quarter, 4 minutes from Mehrangarh Fort.
                </p>
                <div className="space-y-3 pt-2">
                  <Link
                    to="/rooms"
                    className="block w-full text-center py-3.5 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-xs font-bold rounded-sm shadow-gold hover:opacity-95 transition-opacity uppercase"
                  >
                    VIEW ROOMS
                  </Link>
                  <Link
                    to="/contact"
                    className="block w-full text-center py-3.5 border border-gold/60 text-gold hover:bg-gold/10 font-serif-sc tracking-[0.3em] text-xs font-bold rounded-sm transition-colors uppercase"
                  >
                    ENQUIRE NOW
                  </Link>
                </div>
                <div className="text-center pt-2 font-serif text-xs tracking-widest text-gold/90 border-t border-gold/20">
                  <a href="tel:+917023348285" className="hover:underline flex items-center justify-center gap-2">
                    <Phone size={13} /> +91-7023348285
                  </a>
                </div>
              </div>

              {/* Card 2: More to Discover */}
              <div className="bg-card border border-gold/20 p-8 shadow-frame rounded-sm space-y-6">
                <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] uppercase font-bold">
                  MORE TO DISCOVER
                </div>
                <ul className="space-y-4 font-serif text-sm">
                  {attractionList.map((item: any) => {
                    const itemSlug = item.slug || item.id || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const isActive = item.title?.toLowerCase() === attraction.title?.toLowerCase();
                    return (
                      <li key={item.id || item.title}>
                        <Link 
                          to={`/attractions/${itemSlug}`}
                          className={`flex items-center gap-3 transition-colors ${isActive ? "text-gold font-bold" : "text-foreground/80 hover:text-gold"}`}
                        >
                          <span className="text-gold text-xs">→</span>
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="pt-4 border-t border-gold/10">
                  <Link
                    to="/attractions"
                    className="font-serif-sc text-[10px] tracking-[0.3em] text-gold hover:text-gold-glow uppercase font-bold flex items-center gap-2"
                  >
                    FULL JODHPUR GUIDE →
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Pagination Links */}
        <div className="max-w-6xl mx-auto mt-20 pt-10 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-6 font-serif-sc text-xs tracking-widest">
          {prevAttraction && (
            <Link 
              to={`/attractions/${prevAttraction.slug || prevAttraction.id || prevAttraction.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="text-foreground/70 hover:text-gold flex items-center gap-2 uppercase font-semibold"
            >
              <ArrowLeft size={14} className="text-gold" />
              <span>PREVIOUS: {prevAttraction.title}</span>
            </Link>
          )}
          
          <Link to="/attractions" className="text-gold hover:underline uppercase font-bold tracking-[0.3em]">
            ← FULL JODHPUR GUIDE
          </Link>

          {nextAttraction && (
            <Link 
              to={`/attractions/${nextAttraction.slug || nextAttraction.id || nextAttraction.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="text-foreground/70 hover:text-gold flex items-center gap-2 uppercase font-semibold"
            >
              <span>NEXT: {nextAttraction.title}</span>
              <ArrowRight size={14} className="text-gold" />
            </Link>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Quick Action Button (As seen in Rani Mahal Screenshot) */}
      <a
        href="https://wa.me/917023348285?text=Hello%20Raj%20Mandir%20Homestay%2C%20I%20would%20like%20to%20enquire%20about%20staying%20in%20Jodhpur"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 border-2 border-white/40"
        aria-label="WhatsApp Quick Contact"
      >
        <MessageCircle size={28} />
      </a>
    </PageShell>
  );
}
