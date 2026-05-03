import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import hero from "@/assets/page-feedback-hero.jpg";
import { Sparkles } from "lucide-react";

const Feedback = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({ name: "", origin: "", chamber: "", message: "", rating: 5 });

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll(".gb-field"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out", delay: 0.3 }
    );
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
      title="Sign the Royal Guestbook — Raj Mandir"
      description="Inscribe your impressions in our centuries-old guestbook tradition at Raj Mandir Guest House."
    >
      <PageHero
        eyebrow="THE ROYAL GUESTBOOK"
        title="Inscribe your"
        accent="memory"
        subtitle="A leaf in the palace ledger, a verse for those who follow."
        image={hero}
        alt="Ornate gold guestbook on marble table"
      />

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
                <FieldRoyal
                  label="Your Esteemed Name"
                  value={data.name}
                  onChange={(v) => setData({ ...data, name: v })}
                  required
                  maxLength={80}
                />
                <FieldRoyal
                  label="From which corner of the world"
                  value={data.origin}
                  onChange={(v) => setData({ ...data, origin: v })}
                  maxLength={80}
                />
                <FieldRoyal
                  label="Chamber in which you stayed"
                  value={data.chamber}
                  onChange={(v) => setData({ ...data, chamber: v })}
                  maxLength={80}
                />

                <div className="gb-field">
                  <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">
                    YOUR INSCRIPTION
                  </label>
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
                  <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">
                    YOUR PRAISE
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setData({ ...data, rating: n })}
                        className={`text-2xl transition-all duration-500 ${
                          n <= data.rating ? "text-gold scale-110" : "text-muted-foreground/30 hover:text-gold/60"
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

const FieldRoyal = ({
  label,
  value,
  onChange,
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
}) => (
  <div className="gb-field">
    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">
      {label.toUpperCase()}
    </label>
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
