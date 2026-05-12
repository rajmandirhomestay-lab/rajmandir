import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import { ChevronDown } from "lucide-react";
import heroImgFallback from "@/assets/page-booking-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

import { useFaqs, useHomepageSections } from "@/lib/api";

const initialFaqs = [
  {
    category: "Booking & Reservations",
    items: [
      { q: "How do I secure a reservation at Raj Mandir?", a: "Reservations can be made directly through our website's booking portal or by contacting our reservations desk via phone or email. A deposit is required to confirm your stay." },
      { q: "What is your cancellation and refund policy?", a: "We offer full refunds for cancellations made at least 14 days prior to arrival. Cancellations within 14 days will incur a one-night retention charge. Special packages may have non-refundable terms." },
    ]
  },
  {
    category: "Palace Chambers & Stay",
    items: [
      { q: "What are the check-in and check-out timings?", a: "Check-in begins at 2:00 PM, and check-out is by 11:00 AM. Early check-ins and late check-outs are subject to availability and may incur additional charges." },
      { q: "Are the rooms equipped with modern amenities?", a: "Yes, while preserving the heritage aesthetics, all chambers feature modern air conditioning, en-suite bathrooms, premium toiletries, and complimentary Wi-Fi." },
      { q: "Do you accommodate extra beds for children?", a: "Yes, extra beds can be arranged in our larger suites (Maharaja & Haveli Suites) for an additional fee. Please inform us during booking." },
    ]
  },
  {
    category: "Dining & Culinary",
    items: [
      { q: "Is breakfast included in the tariff?", a: "Yes, a complimentary royal breakfast is served daily on our rooftop overlooking the Mehrangarh Fort." },
      { q: "Do you cater to dietary restrictions or vegan preferences?", a: "Absolutely. Our chefs can prepare customized meals tailored to your dietary requirements, including vegan, gluten-free, and Jain food options, with prior notice." },
    ]
  },
  {
    category: "Travel & Location",
    items: [
      { q: "How far is the guest house from the airport and railway station?", a: "Raj Mandir is approximately 8 km (20 minutes) from Jodhpur Airport and 3 km (10 minutes) from the Jodhpur Junction Railway Station." },
      { q: "Do you provide airport transfers?", a: "Yes, we offer chauffeur-driven airport and railway station transfers. This service can be added during your booking process." },
      { q: "Can you arrange local tours and desert safaris?", a: "Our concierge desk specializes in curating bespoke experiences, including Bishnoi village safaris, guided fort walks, and curated shopping tours in the Blue City." },
    ]
  }
];

export const FAQ = () => {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openItem, setOpenItem] = useState<{ cat: number, item: number } | null>({ cat: 0, item: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: dbFaqs } = useFaqs();
  const { data: sections } = useHomepageSections();

  const faqSection = sections?.find(s => s.section_key === 'faq');
  const heroImg = faqSection?.content?.image_url || heroImgFallback;

  const faqs = dbFaqs && dbFaqs.length > 0 ? (() => {
    const grouped = dbFaqs.reduce((acc: any, faq: any) => {
      const cat = faq.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ q: faq.question, a: faq.answer });
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items: items as any[]
    }));
  })() : initialFaqs;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-section",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const toggleItem = (cIndex: number, iIndex: number) => {
    if (openItem?.cat === cIndex && openItem?.item === iIndex) {
      setOpenItem(null);
    } else {
      setOpenItem({ cat: cIndex, item: iIndex });
      setOpenCategory(cIndex);
    }
  };

  return (
    <PageShell
      title="FAQ & Inquiries — Raj Mandir"
      description="Find answers to common questions regarding bookings, stay, dining, and travel at Raj Mandir Guest House."
    >
      <PageHero
        eyebrow="GUEST CONCIERGE"
        title="Curated"
        accent="Inquiries"
        subtitle="Essential information to help you plan your royal stay."
        image={heroImg}
        alt="Palace courtyard"
      />

      <div ref={containerRef} className="bg-background relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-foreground">Common Curiosities</h2>
            <div className="divider-gold mt-6 max-w-xs mx-auto"><span className="text-gold text-sm">❖</span></div>
          </div>

          <div className="space-y-12">
            {faqs.map((cat, cIndex) => (
              <div key={cIndex} className="faq-section bg-card/60 backdrop-blur-md border border-gold/20 shadow-frame p-8 md:p-12">
                <h3 className="font-serif-sc text-gold tracking-[0.3em] text-sm mb-8 border-b border-gold/10 pb-4">
                  {cat.category.toUpperCase()}
                </h3>

                <div className="space-y-4">
                  {cat.items.map((item, iIndex) => {
                    const isOpen = openItem?.cat === cIndex && openItem?.item === iIndex;
                    return (
                      <div 
                        key={iIndex} 
                        className={`border-b border-gold/10 transition-colors duration-500 ${isOpen ? 'bg-gold/5' : 'hover:bg-gold/5'}`}
                      >
                        <button
                          onClick={() => toggleItem(cIndex, iIndex)}
                          className="w-full flex items-center justify-between py-6 px-4 text-left focus:outline-none group"
                        >
                          <span className={`font-display text-2xl transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-foreground group-hover:text-gold/80'}`}>
                            {item.q}
                          </span>
                          <span className={`ml-6 shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180 text-gold' : 'text-muted-foreground group-hover:text-gold/80'}`}>
                            <ChevronDown size={24} />
                          </span>
                        </button>
                        
                        <div 
                          className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                          <div className="overflow-hidden">
                            <p className="font-serif text-muted-foreground leading-relaxed px-4 pb-6 pt-2">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center border border-gold/30 p-10 bg-royal-deep/50 shadow-gold backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.1),transparent_70%)] pointer-events-none" />
            <h3 className="font-display text-3xl text-foreground mb-4">Still seeking answers?</h3>
            <p className="font-serif text-muted-foreground mb-8">Our concierge is at your service round the clock.</p>
            <a href="/contact" className="inline-flex font-serif-sc tracking-widest text-xs px-8 py-4 border border-gold text-gold hover:bg-gold hover:text-royal-deep transition-all duration-500">
              CONTACT CONCIERGE
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default FAQ;
