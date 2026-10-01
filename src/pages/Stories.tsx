import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useStories, useHomepageSections, useSliderSettings, usePageHero } from "@/lib/api";
import { UnifiedSlider, SliderSettings } from "@/components/palace/UnifiedSlider";

import heroImgFallback from "@/assets/page-stories-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

export const Stories = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const { data: dbStories, isLoading } = useStories();
  const { data: sections } = useHomepageSections();
  const { data: sliderSettings } = useSliderSettings('stories');
  const { data: pageHero } = usePageHero('stories');

  const heroImgFallbackCurrent = sections?.find(s => s.section_key === 'stories')?.content?.image_url || heroImgFallback;

  const defaultSliderSettings: SliderSettings = {
    slide_speed: 4000,
    transition_type: "slide",
    autoplay: true,
    pause_on_hover: true,
    show_dots: true,
    show_arrows: true,
    loop: true,
    animation_duration: 1000
  };
  const finalSliderSettings = sliderSettings || defaultSliderSettings;

  const fallbackStories = [
    {
      id: "blue-alleys",
      title: "The Indigo Alleys of Navchokiya",
      category: "HERITAGE",
      date: "October 14, 2024",
      excerpt: "Wandering through the cobalt-washed corridors beneath the towering shadow of Mehrangarh Fort.",
      full_description: "Every corner of Navchokiya holds centuries of folklore. The indigo wash on Brahmin homes not only repels the desert heat and insects but imbues the morning breeze with a tranquil blue serenity found nowhere else on earth.",
      images: [heroImgFallbackCurrent],
      readTime: "5 MIN READ",
    },
    {
      id: "sandstone-whispers",
      title: "Sandstone Carved by Sun and Time",
      category: "ARCHITECTURE",
      date: "September 28, 2024",
      excerpt: "The golden Chittar sandstone that catches the first desert dawn and keeps the midday hush.",
      full_description: "Jodhpur's master stone carvers worked with chisel and melody. At Raj Mandir, each jharokha balcony was calculated to catch the desert breeze, creating natural cooling chambers that have outlasted empires.",
      images: [heroImgFallbackCurrent],
      readTime: "6 MIN READ",
    },
    {
      id: "royal-thali",
      title: "Flavours of the Thar Desert",
      category: "CULINARY",
      date: "August 19, 2024",
      excerpt: "Ker sangri, slow-simmered daal baati churma, and heirloom spice secrets handed down for generations.",
      full_description: "In the harsh Thar desert, preservation became an art form. Dried berries, Mathania chilies, and ghee crafted from indigenous Gir cows form a feast fit for warriors and kings, celebrated nightly on our rooftop terrace.",
      images: [heroImgFallbackCurrent],
      readTime: "4 MIN READ",
    },
    {
      id: "starlit-evenings",
      title: "Twilight Serenades Above the Fort",
      category: "RITUALS",
      date: "July 12, 2024",
      excerpt: "When brass lanterns flicker to life and the sarangi weaves through the desert evening air.",
      full_description: "As twilight blankets the Mehrangarh cliff in royal violet, the rooftop of Raj Mandir transforms. Folk ballads of desert romance and devotional poetry drift into the night sky, accompanied by candlelit dinner and quiet conversation.",
      images: [heroImgFallbackCurrent],
      readTime: "5 MIN READ",
    },
  ];

  const dbEntries = dbStories?.map((s: any) => {
    let dateStr = "October 14, 2024";
    if (s.created_at) {
      try {
        const d = new Date(s.created_at);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      } catch (_) {}
    }

    const storyImages = Array.isArray(s.travel_story_images)
      ? s.travel_story_images.map((img: any) => (typeof img === 'string' ? img : img?.image_url)).filter(Boolean)
      : [];

    return {
      id: String(s.slug || s.id || Math.random()),
      title: s.title || "Heritage Story",
      category: s.category || "HERITAGE",
      date: dateStr,
      excerpt: s.excerpt || s.short_description || "Wandering through the royal heritage of Jodhpur.",
      full_description: (typeof s.content === 'object' && s.content?.text) ? s.content.text : (typeof s.content === 'string' ? s.content : s.full_description || ""),
      images: storyImages.length > 0 ? storyImages : [heroImgFallbackCurrent],
      readTime: "5 MIN READ",
    };
  }) || [];

  // Treat all 4 Journey items equally in a 2x2 grid
  const journeyItems = dbEntries.length >= 4 
    ? dbEntries.slice(0, 4) 
    : dbEntries.length > 0 
    ? [...dbEntries, ...fallbackStories.slice(dbEntries.length, 4)]
    : fallbackStories;

  const toggleStory = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedStoryId(expandedStoryId === id ? null : id);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".journey-card", 
        { y: 30, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ".journey-grid", start: "top 90%" },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [journeyItems]);

  return (
    <PageShell
      title="Journeys & Travel Stories — Raj Mandir Jodhpur"
      description="Royal chronicles, architectural guides, and culinary secrets from the heart of the Blue City."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "PALACE JOURNALS"}
        title={pageHero?.title || "The Royal"}
        accent={pageHero?.accent || "Chronicles"}
        subtitle={pageHero?.subtitle || "Stories of sandstone, indigo, and the enduring romance of Marwar."}
        image={pageHero?.image_url || heroImgFallbackCurrent}
        alt="Ancient books and scrolls"
      />

      <div ref={containerRef} className="bg-background text-foreground relative">
        <div className="absolute inset-0 marble-texture opacity-30 pointer-events-none" />

        {/* 2 × 2 EQUAL-SIZED BLOCKS JOURNEY GRID */}
        <section className="relative py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center mb-16 md:mb-20">
              <div className="font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase mb-4">
                ★ CHRONICLES OF MARWAR ★
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground font-bold leading-tight">
                Journeys Through <span className="text-heritage-gradient italic">History</span>
              </h2>
              <div className="divider-gold mt-6 max-w-xs mx-auto">
                <span className="font-display text-gold text-xl">❖</span>
              </div>
            </div>

            {/* 2 Columns × 2 Rows on Desktop & Tablet, 1 Column on Mobile */}
            <div className="journey-grid grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {journeyItems.map((entry, index) => (
                <article
                  key={entry.id || index}
                  className="journey-card group bg-card/90 backdrop-blur-sm border border-gold/20 shadow-frame hover:border-gold/50 hover:shadow-gold transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full"
                >
                  {/* Uniform Image Area with Royal Jharokha Arch (Oval Top) */}
                  <div className="p-4 pb-0">
                    <div className="relative aspect-[16/10] jharokha-frame border border-gold/30 bg-muted/20 shadow-md">
                      <UnifiedSlider 
                        images={entry.images?.length > 0 ? entry.images : [heroImgFallbackCurrent]} 
                        settings={finalSliderSettings as unknown as SliderSettings}
                        className="w-full h-full"
                      />
                      <div className="absolute top-4 left-4 z-20 font-serif-sc text-gold bg-royal-deep/85 backdrop-blur-md border border-gold/30 px-3 py-1 text-[10px] tracking-[0.3em] uppercase font-bold shadow-md">
                        {entry.category}
                      </div>
                    </div>
                  </div>

                  {/* Uniform Card Body & Hierarchy */}
                  <div className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-serif-sc text-[10px] tracking-[0.3em] text-gold uppercase font-bold">
                        <span>JOURNEY · {String(index + 1).padStart(2, '0')}</span>
                        <span className="text-muted-foreground/70">{entry.readTime}</span>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl text-foreground group-hover:text-gold transition-colors duration-300 leading-tight font-bold uppercase tracking-tight">
                        {entry.title}
                      </h3>

                      <div className="w-12 h-px bg-gold/30" />

                      <p className="font-serif text-base sm:text-lg text-muted-foreground leading-relaxed italic">
                        "{entry.excerpt}"
                      </p>

                      {expandedStoryId === entry.id && (
                        <div className="font-serif text-muted-foreground text-sm sm:text-base leading-relaxed pt-4 border-t border-gold/20 whitespace-pre-wrap animate-fade-in">
                          {entry.full_description}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Action */}
                    <div className="pt-4 border-t border-gold/20 flex items-center justify-between mt-auto">
                      <span className="font-serif-sc text-[10px] tracking-widest text-muted-foreground uppercase font-bold">{entry.date}</span>
                      <button
                        onClick={(e) => toggleStory(entry.id, e)}
                        className="group/btn inline-flex items-center gap-2 font-serif-sc tracking-[0.25em] text-xs text-foreground hover:text-gold font-bold uppercase transition-colors"
                      >
                        {expandedStoryId === entry.id ? "CLOSE CHAPTER ↑" : "READ CHAPTER →"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Dispatch CTA */}
        <section className="relative py-28 md:py-36 px-6 bg-background border-t border-gold/20">
          <div className="absolute inset-0 lattice-pattern opacity-5 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="divider-gold mb-10 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
            <div className="font-serif-sc text-gold tracking-[0.5em] text-xs font-bold uppercase mb-4">★ THE DISPATCH ★</div>
            <h3 className="font-display text-4xl sm:text-5xl text-foreground font-bold mb-6">The Royal Dispatch</h3>
            <p className="font-serif italic text-lg sm:text-xl text-muted-foreground mb-10">
              Subscribe to receive our seasonal travel journals, architectural insights, and special heritage offers directly in your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="YOUR ROYAL EMAIL" 
                className="flex-grow bg-card border border-gold/20 focus:border-gold px-6 py-4 font-serif text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 rounded-sm"
              />
              <button className="bg-heritage-brown text-white font-serif-sc tracking-[0.25em] text-xs px-10 py-4 hover:bg-heritage-orange hover:scale-[1.02] transition-all font-bold uppercase rounded-sm shadow-md">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Stories;
