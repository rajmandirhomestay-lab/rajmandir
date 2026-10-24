import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { DustParticles } from "@/components/palace/DustParticles";
import { usePageHero, useAboutContent, useAboutFeatures, useAboutGallery } from "@/lib/api";
import { MapPin, Heart, Utensils, BedDouble, Coffee, Wifi, Star, Camera, Wind, Sun, Moon, Compass, Palmtree, CheckCircle } from "lucide-react";
import { isVideoUrl } from "@/lib/videoCompression";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  MapPin, Heart, Utensils, BedDouble, Coffee, Wifi, Star, Camera, Wind, Sun, Moon, Compass, Palmtree, CheckCircle
};

import heroImgFallback from "@/assets/page-about-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { data: pageHero } = usePageHero('about');
  const { data: aboutContent } = useAboutContent();
  const { data: features } = useAboutFeatures();
  const { data: gallery } = useAboutGallery();

  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  const rajMandirContent = aboutContent?.find((c: any) => c.section_key === 'about_raj_mandir');
  const experienceContent = aboutContent?.find((c: any) => c.section_key === 'the_experience');

  const s1Media = rajMandirContent?.video_url || rajMandirContent?.image_url;
  const isS1Video = isVideoUrl(s1Media);

  const s2Media = experienceContent?.video_url || experienceContent?.image_url;
  const isS2Video = isVideoUrl(s2Media);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in animations for Section 1
      if (section1Ref.current) {
        gsap.from(".s1-text > *", { scrollTrigger: { trigger: section1Ref.current, start: "top 75%" }, y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
        gsap.from(".s1-img", { scrollTrigger: { trigger: section1Ref.current, start: "top 75%" }, scale: 1.05, opacity: 0, duration: 1.2, ease: "power3.out" });
      }

      // Fade in animations for Section 2
      if (section2Ref.current) {
        gsap.from(".s2-text > *", { scrollTrigger: { trigger: section2Ref.current, start: "top 75%" }, y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
        gsap.from(".s2-img", { scrollTrigger: { trigger: section2Ref.current, start: "top 75%" }, scale: 1.05, opacity: 0, duration: 1.2, ease: "power3.out" });
      }
    });
    return () => ctx.revert();
  }, [aboutContent, features]);

  return (
    <PageShell
      title="About Us — Raj Mandir Hotel, Jodhpur"
      description="The story of Raj Mandir — where heritage meets hospitality."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "OUR HERITAGE"}
        title={pageHero?.title || "Raj Mandir"}
        accent={pageHero?.accent || "Hotel"}
        subtitle={pageHero?.subtitle || "Experience the authentic Jodhpur hospitality in our beautifully restored heritage home."}
        image={pageHero?.image_url || heroImgFallback}
        alt="About Raj Mandir Hotel"
      />

      {/* SECTION 1: ABOUT RAJ MANDIR */}
      <section ref={section1Ref} className="relative py-24 md:py-32 px-6 bg-background overflow-hidden">
        <DustParticles count={10} />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="s1-text space-y-6">
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold">
              {rajMandirContent?.title || "About Raj Mandir"}
            </h2>
            {rajMandirContent?.subtitle && (
              <h3 className="font-serif italic text-xl md:text-2xl text-heritage-gradient">
                {rajMandirContent.subtitle}
              </h3>
            )}
            <div className="divider-gold"><span className="text-gold">❖</span></div>
            <div className="font-serif text-lg text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
              {rajMandirContent?.description || "Raj Mandir was raised at the foot of Mehrangarh as a summer residence..."}
            </div>
          </div>
          <div className="s1-img relative aspect-[4/5] rounded-t-full overflow-hidden border border-gold/20 shadow-xl">
            {isS1Video ? (
              <video
                src={s1Media}
                poster={heroImgFallback}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img 
                src={rajMandirContent?.image_url || heroImgFallback} 
                alt="About Raj Mandir" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE EXPERIENCE */}
      <section ref={section2Ref} className="relative py-24 md:py-32 px-6 bg-background border-t border-gold/20 overflow-hidden">
        <div className="absolute inset-0 marble-texture opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="s2-img md:order-1 order-2 relative aspect-[4/3] rounded shadow-lg overflow-hidden border border-gold/10">
            {isS2Video ? (
              <video
                src={s2Media}
                poster={heroImgFallback}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img 
                src={experienceContent?.image_url || heroImgFallback} 
                alt="The Experience" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <div className="s2-text md:order-2 order-1 space-y-6">
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold">
              {experienceContent?.title || "More Than Just a Stay"}
            </h2>
            {experienceContent?.subtitle && (
              <h3 className="font-serif italic text-xl md:text-2xl text-gold-gradient">
                {experienceContent.subtitle}
              </h3>
            )}
            <div className="divider-gold"><span className="text-gold">❖</span></div>
            <div className="font-serif text-lg text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
              {experienceContent?.description || "Experience the royal life with our rooftop dining..."}
            </div>
          </div>
        </div>
      </section>

      {/* ADDITIONAL DYNAMIC SECTIONS ADDED VIA CMS */}
      {aboutContent?.filter((c: any) => c.section_key !== 'about_raj_mandir' && c.section_key !== 'the_experience').map((sec: any, idx: number) => {
        const media = sec.video_url || sec.image_url;
        const isVideo = isVideoUrl(media);
        const isReverse = idx % 2 === 1;

        return (
          <section key={sec.id || idx} className="relative py-24 md:py-32 px-6 bg-background border-t border-gold/20 overflow-hidden">
            <div className="absolute inset-0 marble-texture opacity-30 pointer-events-none" />
            <DustParticles count={8} />
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className={cn("space-y-6", isReverse ? "md:order-2 order-1" : "md:order-1 order-1")}>
                <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <h3 className="font-serif italic text-xl md:text-2xl text-heritage-gradient">
                    {sec.subtitle}
                  </h3>
                )}
                <div className="divider-gold"><span className="text-gold">❖</span></div>
                <div className="font-serif text-lg text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
                  {sec.description}
                </div>
              </div>

              {media && (
                <div className={cn("relative aspect-[16/10] md:aspect-[4/3] rounded shadow-lg overflow-hidden border border-gold/20 group", isReverse ? "md:order-1 order-2" : "md:order-2 order-2")}>
                  {isVideo ? (
                    <video
                      src={media}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={media} 
                      alt={sec.title || "Section visual"} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/30 to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* SECTION 3: WHY GUESTS LOVE RAJ MANDIR */}
      {features && features.length > 0 && (
        <section ref={featuresRef} className="py-24 md:py-32 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold mb-6">Why Choose Us</h2>
              <div className="divider-gold mx-auto"><span className="text-gold">❖</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature: any) => {
                const Icon = ICON_MAP[feature.icon] || CheckCircle;
                return (
                  <div key={feature.id} className="feature-card p-8 bg-card text-card-foreground border border-gold/10 shadow-sm rounded flex flex-col items-center text-center hover:shadow-md hover:border-gold/30 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-2xl text-foreground font-bold mb-3">{feature.title}</h3>
                    <p className="font-serif text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* OPTIONAL GALLERY STRIP */}
      {gallery && gallery.length > 0 && (
        <section className="py-12 bg-black overflow-hidden">
          <div className="flex gap-4 px-4 overflow-x-auto snap-x hide-scrollbar">
            {gallery.map((item: any) => (
              <div key={item.id} className="snap-center shrink-0 w-72 md:w-96 aspect-[4/3] relative rounded overflow-hidden">
                <img src={item.image_url} alt="Gallery view" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
};

export default AboutPage;
