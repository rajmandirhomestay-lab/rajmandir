import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { Sparkles, Quote, CheckCircle2 } from "lucide-react";
import { useHomepageSections, useReviews, usePageHero } from "@/lib/api";
import { supabase } from "@/lib/supabase";

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
  { name: "Rahul Verma", loc: "Delhi, India", text: "Not just a hotel, it's a living museum. The family treats you like royalty.", rating: 5 },
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
  const { data: pageHero } = usePageHero('feedback');

  const feedbackSection = sections?.find(s => s.section_key === 'feedback');
  const heroImgFallbackCurrent = feedbackSection?.content?.image_url || heroImgFallback;

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
  }, []);
  return (
    <PageShell
      title="Guest Experiences — Raj Mandir"
      description="Read stories from our royal guests and share your own legacy in our centuries-old guestbook."
    >
      <PageHero
        eyebrow={pageHero?.eyebrow || "THE ROYAL GUESTBOOK"}
        title={pageHero?.title || "Voices of"}
        accent={pageHero?.accent || "Heritage"}
        subtitle={pageHero?.subtitle || "A leaf in the palace ledger, a verse for those who follow."}
        image={pageHero?.image_url || heroImgFallbackCurrent}
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

      {/* Removed Write Review Form Section as per request */}
    </PageShell>
  );
};

export default Feedback;
