import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Globe } from "lucide-react";
import { useTheme } from "@/lib/theme";

const defaultLinks = [
  { to: "/rooms", label: "CHAMBERS" },
  { to: "/dining", label: "DINING" },
  { to: "/experiences", label: "CHRONICLES" },
  { to: "/day-at-raj-mandir", label: "RITUALS" },
  { to: "/stories", label: "JOURNEYS" },
  { to: "/about", label: "HERITAGE" },
  { to: "/contact", label: "CONTACT" },
  { to: "/booking", label: "RESERVE" },
  { to: "/corner", label: "CORNER" },
];

const languages = [
  { code: "EN", name: "English", gtCode: "en" },
  { code: "HI", name: "Hindi", gtCode: "hi" },
  { code: "FR", name: "Français", gtCode: "fr" },
  { code: "ES", name: "Español", gtCode: "es" },
  { code: "DE", name: "Deutsch", gtCode: "de" },
  { code: "JA", name: "日本語", gtCode: "ja" }
];

export const Footer = () => {
  const { activeTheme } = useTheme();
  const [footerLinks, setFooterLinks] = useState(defaultLinks);
  const [address, setAddress] = useState("Old City, near Mehrangarh Fort · Jodhpur, Rajasthan · 342001");
  const [phone, setPhone] = useState("+91 291 000 0000");
  const [currentLang, setCurrentLang] = useState("EN");

  const footerTextColor = activeTheme?.footerFg || "var(--custom-footer-fg, #ffffff)";
  const footerBgColor = activeTheme?.footerBg || "var(--custom-footer-bg, #091a28)";

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      const gtCode = match[1];
      const lang = languages.find(l => l.gtCode === gtCode);
      if (lang) setCurrentLang(lang.code);
    } else {
      setCurrentLang("EN");
    }
  }, []);

  const handleLanguageChange = (langCode: string, gtCode: string) => {
    setCurrentLang(langCode);

    if (gtCode === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${gtCode}; path=/;`;
      document.cookie = `googtrans=/en/${gtCode}; path=/; domain=${window.location.hostname}`;
    }

    window.location.reload();
  };

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
    <footer
      id="palace-footer"
      className="palace-footer-container relative pt-20 pb-10 px-6 overflow-hidden border-t border-gold/20"
      style={{
        backgroundColor: footerBgColor,
        color: footerTextColor
      }}
    >
      <style>{`
        #palace-footer, #palace-footer * {
          --custom-footer-current: ${activeTheme?.footerFg || 'var(--custom-footer-fg, #ffffff)'};
        }
        #palace-footer a,
        #palace-footer p,
        #palace-footer div:not(.logo-crest),
        #palace-footer span:not(.logo-letter),
        #palace-footer button {
          color: var(--custom-footer-current) !important;
        }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="relative max-w-6xl mx-auto text-center">
        <Link to="/" className="inline-flex flex-col items-center">
          <div className="logo-crest mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-6">
            <span className="logo-letter font-display text-royal-deep text-2xl font-bold">R</span>
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: footerTextColor }}>
            The Raj Mandir
          </div>
          <div className="font-serif-sc text-[11px] tracking-[0.5em] mt-2 font-bold opacity-85" style={{ color: footerTextColor }}>
            JODHPUR · EST. 1894
          </div>
        </Link>

        <div className="divider-gold max-w-md mx-auto mt-8">
          <span className="text-sm opacity-85" style={{ color: footerTextColor }}>❖</span>
        </div>

        <p className="mt-8 font-serif italic max-w-xl mx-auto leading-relaxed opacity-90" style={{ color: footerTextColor }}>
          {address}
          <br />
          Reservations whispered through brass telephones at {phone}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 font-serif-sc text-[11px] tracking-[0.3em]" style={{ color: footerTextColor }}>
          {footerLinks.map((l, i) => (
            <span key={l.to} className="flex items-center gap-3">
              <Link to={l.to} className="transition-opacity duration-300 hover:opacity-75" style={{ color: footerTextColor }}>
                {l.label}
              </Link>
              {i < footerLinks.length - 1 && <span className="opacity-40" style={{ color: footerTextColor }}>·</span>}
            </span>
          ))}
        </div>

        {/* Footer Language Selector */}
        <div className="mt-12 pt-6 border-t border-gold/15 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 font-serif-sc text-[10px] tracking-[0.3em] font-bold mr-2" style={{ color: footerTextColor }}>
            <Globe size={13} style={{ color: footerTextColor }} /> LANGUAGE:
          </div>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code, lang.gtCode)}
              style={{
                color: footerTextColor,
                borderColor: currentLang === lang.code ? footerTextColor : `${footerTextColor}40`,
                backgroundColor: currentLang === lang.code ? `${footerTextColor}15` : 'transparent'
              }}
              className={`font-serif-sc text-[10px] tracking-[0.2em] px-3 py-1 border transition-all duration-300 rounded-sm ${
                currentLang === lang.code
                  ? "font-bold shadow-sm"
                  : "opacity-80 hover:opacity-100 hover:bg-white/5"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div
          className="mt-12 pt-6 border-t font-serif-sc text-[10px] tracking-[0.4em] opacity-75"
          style={{ color: footerTextColor, borderColor: `${footerTextColor}30` }}
        >
          © {new Date().getFullYear()} RAJ MANDIR HOTEL · ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
};
