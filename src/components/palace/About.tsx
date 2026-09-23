import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import aboutFallback from "@/assets/about-palace.jpg";
import { Link } from "react-router-dom";
import { useHomepageSections } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const ref = useRef<HTMLElement>(null);
  const { data: sections } = useHomepageSections();

  const storySection = sections?.find(s => s.section_key === 'story' || s.section_key === 'about');
  const sectionTitle = storySection?.content?.title || "A Legacy of Warm Welcome.";
  const sectionSubtitle = storySection?.content?.subtitle || "Built in 1894 at the foot of Mehrangarh Fort, Raj Mandir was once the summer residence of a Marwari noble. Sandstone carved by hand, jharokha balconies that catch the desert wind, and frescoes touched by both Mughal and Rajput hands.";
  const sectionDesc = storySection?.content?.description || "Today, our family opens these doors as guardians — not owners — inviting travelers to walk softly through history.";
  const sectionImage = storySection?.content?.image_url || storySection?.content?.image || aboutFallback;
  const isVisible = storySection?.is_visible !== false;

  const textColor = storySection?.content?.text_color;
  const bgMode = storySection?.content?.bg_mode;

  const bgClass = bgMode === 'royal' 
    ? 'bg-royal-deep text-white' 
    : 'bg-background text-foreground';

  useEffect(() => {
    if (!isVisible) return;
    const ctx = gsap.context(() => {
      gsap.from(".about-img", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        x: -60, opacity: 0, duration: 1.6, ease: "power3.out",
      });
      gsap.from(".about-text > *", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        y: 40, opacity: 0, duration: 1.2, stagger: 0.18, ease: "power3.out",
      });
      gsap.from(".about-stat", {
        scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
        y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <section id="about" ref={ref} className={`relative py-32 px-6 overflow-hidden border-b border-gold/20 ${bgClass}`}>
      {/* Subtle sandstone carved pattern & radial soft glow */}
      <div className="absolute inset-0 sandstone-texture opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center z-10">
        <div className="about-img jharokha-frame aspect-[4/5] relative shadow-2xl border border-gold/30 shadow-[0_15px_40px_rgba(9,26,40,0.12)]">
          <img
            src={sectionImage}
            alt="Raj Mandir Hotel"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            width={1536}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091a28]/60 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="about-text">
          <div className="font-serif-sc text-gold tracking-[0.5em] text-xs mb-4 font-bold uppercase">★ OUR STORY ★</div>
          <h2 className="font-display text-5xl md:text-6xl leading-tight font-bold">
            {sectionTitle.includes("Warm") ? (
              <>A Legacy of <span className="text-heritage-gradient italic">Warm Welcome</span>.</>
            ) : sectionTitle}
          </h2>
          <div className="divider-gold mt-6 max-w-xs">
            <span className="font-display text-gold text-xl">❖</span>
          </div>
          <p className="mt-8 font-serif text-xl leading-relaxed opacity-90 font-medium">
            {sectionSubtitle}
          </p>
          <p className="mt-5 font-serif italic text-lg leading-relaxed opacity-75">
            {sectionDesc}
          </p>

          <div className="stats-row mt-12 grid grid-cols-3 gap-6 border-t border-gold/20 pt-10">
            {[
              { n: "130+", l: "YEARS OF LEGACY" },
              { n: "12", l: "ROYAL CHAMBERS" },
              { n: "4.9", l: "GUEST RATING" },
            ].map((s) => (
              <div key={s.l} className="about-stat text-center">
                <div className="font-display text-4xl md:text-5xl text-primary font-bold">{s.n}</div>
                <div className="mt-2 font-serif-sc text-[10px] tracking-[0.3em] text-gold font-bold">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-2">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-serif-sc tracking-[0.3em] text-xs px-8 py-4 bg-heritage-brown text-white font-bold rounded-sm shadow-md hover:bg-heritage-orange hover:scale-[1.02] transition-all duration-300 uppercase"
            >
              DISCOVER OUR LEGACY →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
