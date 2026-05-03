import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import hero from "@/assets/page-contact-hero.jpg";
import { Phone, Mail, MapPin, Clock, Sparkles } from "lucide-react";

const Contact = () => {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [data, setData] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".c-card",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ref.current, start: "top 75%" } }
      );
      gsap.fromTo(
        ".c-field",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ref.current, start: "top 70%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) return;
    setSent(true);
  };

  const cards = [
    { icon: Phone, label: "Call the palace", value: "+91 291 000 0000" },
    { icon: Mail, label: "Letter by raven", value: "concierge@rajmandir.in" },
    { icon: MapPin, label: "Find our gates", value: "Old City, near Mehrangarh, Jodhpur 342001" },
    { icon: Clock, label: "Reception hours", value: "Open all hours of the desert" },
  ];

  return (
    <PageShell
      title="Contact Raj Mandir Guest House — Jodhpur"
      description="Reach the palace directly. Reservations, enquiries, and royal hospitality from Raj Mandir Guest House, Jodhpur."
    >
      <PageHero
        eyebrow="REACH THE PALACE"
        title="At the gates of"
        accent="Raj Mandir"
        subtitle="Speak with our khansama, write to our concierge, or simply walk through the brass-bound door."
        image={hero}
        alt="Aerial view of Jodhpur palace courtyard"
      />

      <section ref={ref} className="relative py-28 px-6 overflow-hidden marble-texture">
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="eyebrow mb-4">★ THE PALACE GATES ★</div>
              <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                A few <span className="text-gold-gradient italic">whispers</span> away
              </h2>
              <div className="divider-gold mt-6 max-w-xs"><span className="text-gold">❖</span></div>
              <p className="font-serif italic text-muted-foreground mt-6 text-lg leading-relaxed">
                Whether you wish to reserve a chamber, enquire of a custom journey through Marwar, or simply dream aloud — we listen.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-4">
              {cards.map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="c-card group relative p-6 bg-card/60 backdrop-blur-sm border border-gold/25 hover:border-gold/60 hover:-translate-y-1 transition-all duration-700">
                  <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/70" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/70" />
                  <Icon className="text-gold mb-3 group-hover:scale-110 transition-transform duration-500" size={20} />
                  <div className="font-serif-sc text-[10px] tracking-[0.3em] text-gold mb-1">{label.toUpperCase()}</div>
                  <div className="font-serif text-foreground">{value}</div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="relative mt-6 jharokha-frame overflow-hidden h-72">
              <iframe
                title="Raj Mandir location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.99%2C26.28%2C73.05%2C26.32&layer=mapnik&marker=26.3,73.02"
                className="w-full h-full grayscale-[40%] contrast-110"
                loading="lazy"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-gold/40" />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            {!sent ? (
              <form
                onSubmit={onSubmit}
                className="relative p-10 md:p-12 bg-card/70 backdrop-blur-md border border-gold/30 shadow-frame"
              >
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />

                <div className="mb-8">
                  <div className="eyebrow mb-3">★ A LETTER TO THE PALACE ★</div>
                  <h3 className="font-display text-3xl text-foreground">Write to us</h3>
                </div>

                <div className="space-y-7">
                  <div className="grid md:grid-cols-2 gap-7">
                    <Field label="Your Name" value={data.name} onChange={(v) => setData({ ...data, name: v })} required maxLength={80} />
                    <Field label="Your Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} required maxLength={120} />
                  </div>
                  <Field label="Subject of Enquiry" value={data.subject} onChange={(v) => setData({ ...data, subject: v })} maxLength={120} />
                  <div className="c-field">
                    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">
                      YOUR MESSAGE
                    </label>
                    <textarea
                      rows={6}
                      required
                      maxLength={1500}
                      value={data.message}
                      onChange={(e) => setData({ ...data, message: e.target.value })}
                      className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif italic text-lg text-foreground focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))] transition-all duration-700 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="c-field w-full px-10 py-5 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm shadow-gold hover:scale-[1.01] transition-all duration-700"
                  >
                    DISPATCH THE LETTER
                  </button>
                </div>
              </form>
            ) : (
              <div className="relative p-14 text-center bg-card/70 backdrop-blur-md border border-gold/40 shadow-gold animate-fade-in">
                <Sparkles className="text-gold mx-auto mb-6" size={36} />
                <div className="eyebrow mb-3">★ DELIVERED ★</div>
                <h3 className="font-display text-3xl text-foreground mb-4">Your letter has reached the palace</h3>
                <p className="font-serif italic text-muted-foreground">A reply shall arrive by morning sun.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

const Field = ({
  label,
  value,
  onChange,
  required,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  maxLength?: number;
}) => (
  <div className="c-field">
    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">{label.toUpperCase()}</label>
    <input
      type={type}
      required={required}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif text-lg text-foreground focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))] transition-all duration-700"
    />
  </div>
);

export default Contact;
