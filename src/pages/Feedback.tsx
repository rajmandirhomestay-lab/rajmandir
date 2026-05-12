import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { Sparkles, Quote, CheckCircle2 } from "lucide-react";
import { useHomepageSections, useReviews } from "@/lib/api";

import heroImgFallback from "@/assets/page-feedback-hero.jpg";
import story1 from "@/assets/room-haveli.jpg";
import story2 from "@/assets/dining-rooftop.jpg";

gsap.registerPlugin(ScrollTrigger);

const fallbackFeatured = [
  {
    id: "f1",
    image: story1,
    quote: "A week that felt like a century. The arches whisper tales of old, while the hospitality is as warm as the desert sun.",
    name: "Eleanor & James Whitfield",
    location: "London, UK",
    stay: "Haveli Suite"
  },
  {
    id: "f2",
    image: story2,
    quote: "Every evening on the rooftop was a cinematic experience. The thali, the fort, the stars—it was perfection.",
    name: "Akira Yamamoto",
    location: "Kyoto, Japan",
    stay: "Maharaja Chamber"
  }
];

const fallbackTestimonials = [
  { name: "Sophie Laurent", loc: "Paris, France", text: "The most immersive heritage stay in Jodhpur. Every corner is a photograph waiting to happen.", rating: 5 },
  { name: "Rahul Verma", loc: "Delhi, India", text: "Not just a guest house, it's a living museum. The family treats you like royalty.", rating: 5 },
  { name: "Michael Chen", loc: "Singapore", text: "Incredible attention to detail. The rooms are restored with such love and respect for history.", rating: 4 },
  { name: "Emma Thompson", loc: "Sydney, Australia", text: "The morning light hitting the jharokhas is something I will never forget. Magical.", rating: 5 },
  { name: "David & Sarah", loc: "New York, USA", text: "We extended our stay twice. Raj Mandir feels like a luxurious secret you want to keep to yourself.", rating: 5 },
];

const Feedback = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({ name: "", origin: "", chamber: "", message: "", rating: 5 });
  
  const { data: sections } = useHomepageSections();
  const { data: dbReviews } = useReviews();

  const feedbackSection = sections?.find(s => s.section_key === 'feedback');
  const heroImg = feedbackSection?.content?.image_url || heroImgFallback;

  const featuredStories = dbReviews && dbReviews.filter(r => r.is_featured).length > 0
    ? dbReviews.filter(r => r.is_featured).map((r, i) => ({
        id: r.id,
        image: r.guest_image_url || fallbackFeatured[i % 2].image,
        quote: r.review_text,
        name: r.guest_name,
        location: r.guest_location || "Global Guest",
        stay: r.room_stayed || "Palace Chamber"
      }))
    : fallbackFeatured;

  const testimonials = dbReviews && dbReviews.length > 0
    ? dbReviews.map(r => ({
        name: r.guest_name,
        loc: r.guest_location || "Global Guest",
        text: r.review_text,
        rating: r.rating || 5
      }))
    : fallbackTestimonials;

  useEffect(() => {
    // Floating animations for featured stories
    gsap.utils.toArray(".story-card").forEach((card: any, i) => {
      gsap.to(card, {
        y: i % 2 === 0 ? -15 : 15,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    // Auto-sliding testimonials
    if (reviewsRef.current) {
      const clone = reviewsRef.current.innerHTML;
      reviewsRef.current.innerHTML += clone; // Duplicate for infinite scroll
      
      gsap.to(reviewsRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });
    }

    // Scroll reveal for form
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.querySelectorAll(".gb-field"),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 80%" }
        }
      );
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.message.trim()) return;
    setSubmitted(true);
    gsap.fromTo(
      ".gb-success",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
    );
  };

  return (
    <PageShell
      title="Guest Experiences — Raj Mandir"
      description="Read stories from our royal guests and share your own legacy in our centuries-old guestbook."
    >
      <PageHero
        eyebrow="THE ROYAL GUESTBOOK"
        title="Voices of"
        accent="Heritage"
        subtitle="A leaf in the palace ledger, a verse for those who follow."
        image={heroImg}
        alt="Ornate gold guestbook on marble table"
      />

      {/* Featured Stories Section */}
      <section className="py-24 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)/0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="eyebrow mb-4">★ FEATURED TALES ★</div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Stories from <span className="text-gold-gradient italic">the courtyard</span>
            </h2>
            <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {featuredStories.map((story) => (
              <div key={story.id} className="story-card relative group">
                <div className="absolute inset-0 bg-gold/5 transform translate-x-4 translate-y-4 border border-gold/20 z-0 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6" />
                <div className="relative z-10 bg-card p-8 border border-gold/30 flex flex-col md:flex-row gap-8 items-center shadow-frame">
                  <div className="w-40 h-40 shrink-0 rounded-full overflow-hidden border-4 border-background shadow-gold relative">
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-gold/40 rounded-full pointer-events-none" />
                  </div>
                  <div>
                    <Quote className="text-gold/40 w-10 h-10 mb-4" />
                    <p className="font-serif italic text-lg text-foreground/90 mb-6 leading-relaxed">"{story.quote}"</p>
                    <div>
                      <div className="font-serif-sc tracking-widest text-sm text-gold">{story.name}</div>
                      <div className="font-serif text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        {story.location} <span className="text-gold/50">•</span> Stayed in {story.stay}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto-sliding Testimonials */}
      <section className="py-20 bg-muted/20 border-y border-gold/10 overflow-hidden flex flex-col justify-center relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex w-[200%] md:w-[150%] lg:w-[120%]" ref={reviewsRef}>
          {testimonials.map((t, i) => (
            <div key={i} className="w-[350px] shrink-0 p-6 mx-4 bg-card/60 backdrop-blur-sm border border-gold/20 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => <span key={i} className="text-gold text-lg">★</span>)}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-serif-sc text-gold/70 border border-gold/30 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 size={10} /> VERIFIED
                </div>
              </div>
              <p className="font-serif italic text-muted-foreground mb-6 line-clamp-3">"{t.text}"</p>
              <div>
                <div className="font-serif-sc text-xs tracking-widest text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground/60 mt-1">{t.loc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Write Review Form Section */}
      <section className="relative py-28 px-6 marble-texture overflow-hidden">
        <div className="absolute inset-0 light-rays opacity-25 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          {!submitted ? (
            <form
              ref={formRef}
              onSubmit={onSubmit}
              className="relative p-10 md:p-14 bg-card/70 backdrop-blur-md border border-gold/30 shadow-frame"
            >
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />

              <div className="text-center mb-10">
                <div className="eyebrow mb-3">★ A NEW ENTRY ★</div>
                <h2 className="font-display text-4xl text-foreground">Pen your impressions</h2>
                <div className="divider-gold mt-4 max-w-xs mx-auto"><span className="text-gold">❖</span></div>
              </div>

              <div className="space-y-7">
                <FieldRoyal label="Your Esteemed Name" value={data.name} onChange={(v) => setData({ ...data, name: v })} required maxLength={80} />
                <FieldRoyal label="From which corner of the world" value={data.origin} onChange={(v) => setData({ ...data, origin: v })} maxLength={80} />
                <FieldRoyal label="Chamber in which you stayed" value={data.chamber} onChange={(v) => setData({ ...data, chamber: v })} maxLength={80} />

                <div className="gb-field">
                  <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">YOUR INSCRIPTION</label>
                  <textarea
                    rows={6}
                    required
                    maxLength={1000}
                    value={data.message}
                    onChange={(e) => setData({ ...data, message: e.target.value })}
                    placeholder="The arches, the silence, the morning light…"
                    className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif italic text-lg text-foreground placeholder:text-muted-foreground/60 focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))] transition-all duration-700 resize-none"
                  />
                </div>

                <div className="gb-field">
                  <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">YOUR PRAISE</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setData({ ...data, rating: n })}
                        className={`text-2xl transition-all duration-500 ${
                          n <= data.rating ? "text-gold scale-110 drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "text-muted-foreground/30 hover:text-gold/60"
                        }`}
                        aria-label={`${n} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gb-field pt-4">
                  <button
                    type="submit"
                    className="w-full px-10 py-5 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm shadow-gold hover:scale-[1.01] transition-all duration-700"
                  >
                    SEAL THE INSCRIPTION
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="gb-success relative p-14 text-center bg-card/70 backdrop-blur-md border border-gold/40 shadow-gold">
              <Sparkles className="text-gold mx-auto mb-6" size={36} />
              <div className="eyebrow mb-3">★ SEALED IN GOLD ★</div>
              <h2 className="font-display text-4xl text-foreground mb-4">
                Thank you, <span className="text-gold-gradient italic">{data.name.split(" ")[0]}</span>
              </h2>
              <div className="divider-gold max-w-xs mx-auto my-6"><span className="text-gold">❖</span></div>
              <p className="font-serif italic text-lg text-muted-foreground max-w-md mx-auto">
                Your words have been pressed into the palace ledger, where they shall rest beside a century of voices.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

const FieldRoyal = ({ label, value, onChange, required, maxLength }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; maxLength?: number }) => (
  <div className="gb-field">
    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">{label.toUpperCase()}</label>
    <input
      required={required}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif text-lg text-foreground focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))] transition-all duration-700"
    />
  </div>
);

export default Feedback;
