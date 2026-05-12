import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import heroImgFallback from "@/assets/page-contact-hero.jpg";
import { MapPin, Phone, Mail, MessageCircle, Instagram, Facebook, Twitter, Globe } from "lucide-react";
import { useHomepageSections, useSettings } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { data: sections } = useHomepageSections();
  const { data: settings } = useSettings();

  const contactSection = sections?.find(s => s.section_key === 'contact');
  const heroImg = contactSection?.content?.image_url || heroImgFallback;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reveal-up",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const contactInfo = {
    email: settings?.contact_email || "reservations@rajmandir.com",
    phone: settings?.contact_phone || "+91 98290 12345",
    whatsapp: settings?.contact_whatsapp || "+91 98290 12345",
    address: settings?.contact_address || "Raj Mandir Guest House, Makrana Mohalla, Jodhpur, Rajasthan 342001",
    mapsUrl: settings?.contact_maps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14309.846506305615!2d73.01357605!3d26.29740265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418c460a5d2eb1%3A0x6b442ff98ed7fc92!2sMehrangarh%20Fort!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    instagram: settings?.social_instagram || "#",
    facebook: settings?.social_facebook || "#",
    tripadvisor: settings?.social_tripadvisor || "#",
  };

  return (
    <PageShell
      title="Contact Us — Raj Mandir"
      description="Reach out to us to plan your royal stay in Jodhpur. We are here to assist you with bookings and inquiries."
    >
      <PageHero
        eyebrow="REACH THE PALACE"
        title="Send a"
        accent="Message"
        subtitle="We await your correspondence. Let us tailor your journey into the heart of Marwar."
        image={heroImg}
        alt="Royal door"
      />

      <div ref={containerRef} className="bg-background relative">
        <div className="absolute inset-0 marble-texture pointer-events-none" />

        <section className="relative py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Contact Details Card */}
            <div className="w-full lg:w-5/12">
              <div className="reveal-up bg-card/60 backdrop-blur-md border border-gold/30 p-10 shadow-frame relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
                <div className="absolute inset-2 border border-gold/10 pointer-events-none" />
                
                <h2 className="font-display text-4xl text-foreground mb-8 uppercase tracking-tight">Palace Details</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4 group">
                    <div className="mt-1 w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                      <MapPin size={18} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif-sc text-xs tracking-widest text-gold mb-2">ADDRESS</h3>
                      <p className="font-serif text-muted-foreground leading-relaxed whitespace-pre-line">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="mt-1 w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                      <Phone size={18} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif-sc text-xs tracking-widest text-gold mb-2">TELEPHONE</h3>
                      <p className="font-serif text-muted-foreground">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="mt-1 w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                      <Mail size={18} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif-sc text-xs tracking-widest text-gold mb-2">ELECTRONIC MAIL</h3>
                      <p className="font-serif text-muted-foreground">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gold/20">
                  <h3 className="font-serif-sc text-xs tracking-widest text-gold mb-6">SOCIAL CHANNELS</h3>
                  <div className="flex items-center gap-4">
                    <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 border border-gold/40 flex items-center justify-center text-foreground hover:bg-gold hover:text-royal-deep transition-all duration-300">
                      <Instagram size={18} />
                    </a>
                    <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 border border-gold/40 flex items-center justify-center text-foreground hover:bg-gold hover:text-royal-deep transition-all duration-300">
                      <Facebook size={18} />
                    </a>
                    <a href={contactInfo.tripadvisor} target="_blank" rel="noreferrer" className="w-10 h-10 border border-gold/40 flex items-center justify-center text-foreground hover:bg-gold hover:text-royal-deep transition-all duration-300">
                      <Globe size={18} />
                    </a>
                    
                    <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-4 py-2 hover:bg-[#25D366] hover:text-white transition-colors duration-300">
                      <MessageCircle size={16} />
                      <span className="font-serif-sc text-[10px] tracking-widest uppercase">WHATSAPP</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full lg:w-7/12">
              <div className="reveal-up">
                <div className="mb-10">
                  <div className="font-serif-sc text-gold tracking-widest text-xs mb-4">INQUIRIES</div>
                  <h2 className="font-display text-4xl text-foreground mb-4 uppercase tracking-tight">Compose a Missive</h2>
                  <p className="font-serif text-muted-foreground italic">Whether it is a booking request or a query regarding our experiences, our concierge will respond promptly.</p>
                </div>

                {!submitted ? (
                  <form onSubmit={onSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-0 py-3 font-serif text-lg text-foreground transition-all duration-500 peer"
                          placeholder=" "
                        />
                        <label className="absolute left-0 top-3 font-serif-sc text-[11px] tracking-widest text-muted-foreground/70 pointer-events-none transition-all duration-500 peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-gold peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-gold uppercase">
                          YOUR ESTEEMED NAME
                        </label>
                      </div>
                      <div className="relative group">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-0 py-3 font-serif text-lg text-foreground transition-all duration-500 peer"
                          placeholder=" "
                        />
                        <label className="absolute left-0 top-3 font-serif-sc text-[11px] tracking-widest text-muted-foreground/70 pointer-events-none transition-all duration-500 peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-gold peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-gold uppercase">
                          EMAIL ADDRESS
                        </label>
                      </div>
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-0 py-3 font-serif text-lg text-foreground transition-all duration-500 peer"
                        placeholder=" "
                      />
                      <label className="absolute left-0 top-3 font-serif-sc text-[11px] tracking-widest text-muted-foreground/70 pointer-events-none transition-all duration-500 peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-gold peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-gold uppercase">
                        SUBJECT OF INQUIRY
                      </label>
                    </div>

                    <div className="relative group">
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-0 py-3 font-serif text-lg text-foreground transition-all duration-500 peer resize-none"
                        placeholder=" "
                      />
                      <label className="absolute left-0 top-3 font-serif-sc text-[11px] tracking-widest text-muted-foreground/70 pointer-events-none transition-all duration-500 peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-gold peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-gold uppercase">
                        YOUR MESSAGE
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm px-10 py-5 w-full md:w-auto shadow-gold hover:scale-[1.02] transition-all duration-500"
                    >
                      SEND INQUIRY
                    </button>
                  </form>
                ) : (
                  <div className="p-10 border border-gold/30 bg-gold/5 text-center shadow-gold">
                    <h3 className="font-display text-3xl text-gold mb-4 uppercase">Message Received</h3>
                    <p className="font-serif text-muted-foreground italic">Thank you for your correspondence. Our concierge will be in touch with you shortly to assist with your royal journey.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Map Embed Section */}
        <section className="reveal-up relative py-10 px-6">
          <div className="max-w-7xl mx-auto h-[50vh] min-h-[500px] border border-gold/30 p-2 shadow-frame bg-card">
            <div className="w-full h-full bg-muted flex items-center justify-center relative overflow-hidden filter grayscale-[50%] sepia-[30%] hover:grayscale-0 transition-all duration-1000">
              <iframe 
                src={contactInfo.mapsUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-gold/20" />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Contact;
