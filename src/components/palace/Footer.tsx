import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const defaultLinks = [
    { to: "/rooms", label: "CHAMBERS" },
    { to: "/dining", label: "DINING" },
    { to: "/experiences", label: "EXPERIENCES" },
    { to: "/stories", label: "STORIES" },
    { to: "/about", label: "HERITAGE" },
    { to: "/contact", label: "CONTACT" },
    { to: "/booking", label: "RESERVE" },
    { to: "/feedback", label: "GUESTBOOK" },
  ];

export const Footer = () => {
  const [footerLinks, setFooterLinks] = useState(defaultLinks);
  const [address, setAddress] = useState("Old City, near Mehrangarh Fort · Jodhpur, Rajasthan · 342001");
  const [phone, setPhone] = useState("+91 291 000 0000");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("*")
          .in("key", ["footer_links", "contact_address", "contact_phone"]);
        
        if (data) {
          const linksData = data.find(d => d.key === "footer_links")?.value;
          if (linksData && Array.isArray(linksData) && linksData.length > 0) {
            setFooterLinks(linksData);
          }
          const addr = data.find(d => d.key === "contact_address")?.value;
          if (addr) setAddress(addr);
          const ph = data.find(d => d.key === "contact_phone")?.value;
          if (ph) setPhone(ph);
        }
      } catch (err) {
        console.error("Failed to load footer settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="relative bg-gradient-night text-ivory pt-20 pb-10 px-6 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="relative max-w-6xl mx-auto text-center">
        <Link to="/" className="inline-flex flex-col items-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-6">
            <span className="font-display text-royal-deep text-2xl">R</span>
          </div>
          <div className="font-display text-3xl md:text-4xl text-ivory">Raj Mandir</div>
          <div className="font-serif-sc text-gold text-[11px] tracking-[0.5em] mt-2">JODHPUR · EST. 1894</div>
        </Link>

        <div className="divider-gold max-w-md mx-auto mt-8">
          <span className="text-gold text-sm">❖</span>
        </div>

        <p className="mt-8 font-serif italic text-ivory/70 max-w-xl mx-auto leading-relaxed">
          {address}
          <br />
          Reservations whispered through brass telephones at {phone}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 font-serif-sc text-[11px] tracking-[0.3em] text-ivory/70">
          {footerLinks.map((l, i) => (
            <span key={l.to} className="flex items-center gap-3">
              <Link to={l.to} className="hover:text-gold transition-colors duration-500">{l.label}</Link>
              {i < footerLinks.length - 1 && <span className="text-gold/40">·</span>}
            </span>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gold/20 font-serif-sc text-[10px] tracking-[0.4em] text-ivory/50">
          © {new Date().getFullYear()} RAJ MANDIR GUEST HOUSE · ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
};
