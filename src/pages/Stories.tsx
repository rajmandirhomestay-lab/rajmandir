import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { useStories, useHomepageSections, useSliderSettings } from "@/lib/api";
import { ContentSlider } from "@/components/palace/ContentSlider";

import heroImgFallback from "@/assets/page-stories-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const Stories = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: dbStories, isLoading } = useStories();
  const { data: sections } = useHomepageSections();
  const { data: sliderSettings } = useSliderSettings('stories');

  const heroImg = sections?.find(s => s.section_key === 'stories')?.content?.image_url || heroImgFallback;

  const entries = dbStories?.map((s: any) => ({
    id: s.slug || s.id,
    title: s.title,
    category: "HERITAGE",
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    excerpt: s.short_description || s.full_description,
    images: s.travel_story_images?.map((img: any) => img.image_url) || [],
    readTime: "5 MIN READ",
    isFeatured: s.featured
  })) || [];

  const featuredStory = entries.find(e => e.isFeatured) || entries[0];

  useEffect(() => {
    if (isLoading) return;
    const ctx = gsap.context(() => {
      gsap.from(".featured-card", {
        scrollTrigger: { trigger: ".featured-card", start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });

      gsap.from(".story-card", {
        scrollTrigger: { trigger: ".stories-grid", start: "top 80%" },
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [isLoading, entries]);

  if (isLoading) return <div className="min-h-screen bg-royal-deep flex items-center justify-center text-gold">Loading...</div>;

  return (
    <PageShell
      title="Travel Stories — Raj Mandir Jodhpur"
      description="Royal chronicles, architectural guides, and culinary secrets from the heart of the Blue City."
    >
      <PageHero
        eyebrow="PALACE JOURNALS"
        title="The Royal"
        accent="Chronicles"
        subtitle="Stories of sandstone, indigo, and the enduring romance of Marwar."
        image={heroImg}
        alt="Ancient books and scrolls"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />
        
        {/* Featured Story */}
        {featuredStory && (
          <section className="relative py-24 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="featured-card relative grid lg:grid-cols-2 bg-card border border-gold/20 shadow-frame overflow-hidden">
                <div className="relative h-[500px] lg:h-auto overflow-hidden">
                  <ContentSlider 
                    images={featuredStory.images} 
                    settings={sliderSettings}
                    className="w-full h-full"
                    autoPlay={true}
                  />
                </div>
                <div className="p-8 md:p-16 flex flex-col justify-center bg-background/50 backdrop-blur-sm relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="font-serif-sc text-gold tracking-[0.4em] text-xs uppercase">{featuredStory.category}</div>
                    <div className="h-px w-8 bg-gold/30" />
                    <div className="font-serif-sc text-muted-foreground tracking-[0.2em] text-[10px] uppercase">{featuredStory.readTime}</div>
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight uppercase tracking-tight">{featuredStory.title}</h2>
                  <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-10 italic">
                    "{featuredStory.excerpt}"
                  </p>
                  <a href={`/stories/${featuredStory.id}`} className="group inline-flex items-center gap-4 font-serif-sc tracking-[0.3em] text-xs text-foreground hover:text-gold transition-colors">
                    READ THE FULL CHAPTER <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stories Grid */}
        <section className="relative py-24 px-6 border-t border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="stories-grid grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {entries.filter(e => e.id !== featuredStory?.id).map((entry) => (
                <article key={entry.id} className="story-card group">
                  <div className="relative aspect-[4/5] overflow-hidden jharokha-frame mb-8 border border-gold/10 bg-muted/20">
                     <ContentSlider 
                        images={entry.images} 
                        settings={sliderSettings}
                        className="w-full h-full"
                     />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-serif-sc text-[10px] tracking-[0.3em] text-gold uppercase">
                      <span>{entry.category}</span>
                      <span className="text-muted-foreground/60">{entry.readTime}</span>
                    </div>
                    <h3 className="font-display text-3xl text-foreground group-hover:text-gold transition-colors duration-500 leading-tight uppercase">
                      {entry.title}
                    </h3>
                    <p className="font-serif text-muted-foreground line-clamp-3 leading-relaxed italic">
                      {entry.excerpt}
                    </p>
                    <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                      <span className="font-serif-sc text-[9px] tracking-widest text-muted-foreground uppercase">{entry.date}</span>
                      <a href={`/stories/${entry.id}`} className="font-serif-sc text-[10px] tracking-widest text-gold hover:underline">DISCOVER →</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Dispatch CTA */}
        <section className="relative py-32 px-6 bg-muted/5 border-t border-gold/5">
           <div className="absolute inset-0 lattice-pattern opacity-5" />
           <div className="max-w-3xl mx-auto text-center relative z-10">
             <div className="divider-gold mb-12 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
             <h3 className="font-display text-4xl mb-6">The Royal Dispatch</h3>
             <p className="font-serif text-lg text-muted-foreground mb-10 italic">
               Subscribe to receive our seasonal travel journals, architectural insights, and special heritage offers directly in your inbox.
             </p>
             <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
               <input 
                 type="email" 
                 placeholder="YOUR ROYAL EMAIL" 
                 className="flex-grow bg-background border border-gold/20 focus:border-gold px-6 py-4 font-serif text-sm outline-none transition-all"
               />
               <button className="bg-gold text-royal-deep font-serif-sc tracking-widest text-xs px-10 py-4 hover:bg-gold-glow transition-all">
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
