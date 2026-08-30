import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu, X, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

const leftNavLinks = [
  { to: "/rooms", label: "CHAMBERS" },
  { to: "/dining", label: "FEASTS" },
  { to: "/experiences", label: "JOURNEYS" },
  { to: "/attractions", label: "WONDERS" },
];

const rightNavLinks = [
  { to: "/stories", label: "CHRONICLES" },
  { to: "/about", label: "LEGACY" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "EN", name: "English", gtCode: "en" },
    { code: "HI", name: "Hindi", gtCode: "hi" },
    { code: "FR", name: "Français", gtCode: "fr" },
    { code: "ES", name: "Español", gtCode: "es" },
    { code: "DE", name: "Deutsch", gtCode: "de" },
    { code: "JA", name: "日本語", gtCode: "ja" }
  ];

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
    setLangOpen(false);
    setOpen(false);

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
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      drawerRef.current,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.9, ease: "power4.out" }
    ).fromTo(
      itemsRef.current?.querySelectorAll(".m-link") || [],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 ${scrolled
          ? "backdrop-blur-xl bg-[#091a28]/95 border-b border-[#5eb3e4]/30 shadow-xl"
          : "backdrop-blur-md bg-[#091a28]/85 border-b border-[#5eb3e4]/20"
          }`}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5eb3e4]/40 to-transparent" />
        <div className="relative mx-auto max-w-[1700px] px-4 md:px-8 py-4 flex items-center justify-between min-h-[80px]">

          {/* Mobile Logo Left (visible only on small screens < lg) */}
          <Link to="/" className="flex lg:hidden flex-col">
            <span className="font-serif-sc text-[8px] tracking-[0.35em] text-[#5eb3e4] uppercase font-semibold">THE</span>
            <span className="font-display text-white text-base tracking-wider font-bold">RAJ MANDIR</span>
          </Link>

          {/* Desktop Left Nav Links (4 Links - Fluid responsive flex container) */}
          <nav className="hidden lg:flex items-center justify-end gap-2.5 lg:gap-4 xl:gap-7 flex-1 min-w-0 pr-2 lg:pr-4 xl:pr-8">
            {leftNavLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-[10px] lg:text-xs xl:text-sm tracking-wider xl:tracking-[0.2em] whitespace-nowrap shrink-0 transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-[#5eb3e4] after:transition-all after:duration-300 ${isActive
                    ? "text-[#5eb3e4] font-bold after:w-full"
                    : "text-white/90 font-medium hover:text-[#5eb3e4] after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          {/* CENTER LOGO TYPOGRAPHY (Fluid responsive flex item - Zero Overlap Guaranteed!) */}
          <Link
            to="/"
            className="hidden lg:flex flex-col items-center justify-center text-center shrink-0 px-2 lg:px-4 xl:px-8 group select-none"
          >
            <div className="font-serif-sc text-[7px] lg:text-[8px] tracking-[0.4em] text-[#5eb3e4] uppercase font-semibold mb-0.5">THE</div>
            <div className="font-display text-white text-base lg:text-xl xl:text-2xl tracking-[0.18em] xl:tracking-[0.2em] font-bold drop-shadow-sm leading-tight transition-colors group-hover:text-[#5eb3e4] whitespace-nowrap">
              RAJ MANDIR
            </div>
            <div className="font-serif-sc text-[7px] lg:text-[8px] tracking-[0.4em] text-[#5eb3e4] uppercase font-semibold mt-0.5">
              GUEST HOUSE
            </div>
          </Link>

          {/* Desktop Right Nav Items (2 Nav Links + Language Switcher + Reserve Button - Fluid responsive flex container) */}
          <div className="hidden lg:flex items-center justify-start gap-2.5 lg:gap-4 xl:gap-7 flex-1 min-w-0 pl-2 lg:pl-4 xl:pl-8">
            {rightNavLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-[10px] lg:text-xs xl:text-sm tracking-wider xl:tracking-[0.2em] whitespace-nowrap shrink-0 transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-[#5eb3e4] after:transition-all after:duration-300 ${isActive
                    ? "text-[#5eb3e4] font-bold after:w-full"
                    : "text-white/90 font-medium hover:text-[#5eb3e4] after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}

            {/* Language Switcher Desktop */}
            <div className="relative shrink-0">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 font-serif-sc text-[10px] lg:text-xs xl:text-sm tracking-wider xl:tracking-[0.2em] text-white/90 font-medium hover:text-[#5eb3e4] transition-colors py-1 whitespace-nowrap"
              >
                <Globe size={13} className="text-[#5eb3e4]" /> {currentLang}
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-[#091a28] border border-[#5eb3e4]/30 shadow-xl py-2 flex flex-col z-50 animate-fade-in backdrop-blur-md rounded-sm">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code, lang.gtCode)}
                      className={`text-left px-4 py-2 font-serif text-sm transition-colors ${currentLang === lang.code ? "text-[#5eb3e4] font-bold bg-[#1e406d]" : "text-white hover:text-[#5eb3e4] hover:bg-[#1e406d]"}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Outline Reserve Button */}
            <Link
              to="/booking"
              className="font-serif-sc tracking-wider xl:tracking-[0.2em] text-[10px] lg:text-xs xl:text-sm px-2.5 lg:px-4 xl:px-5 py-1 lg:py-2 border border-[#5eb3e4]/80 text-white font-semibold hover:bg-[#5eb3e4] hover:text-[#091a28] transition-all duration-300 shadow-sm whitespace-nowrap shrink-0"
            >
              RESERVE
            </Link>
          </div>

          {/* Mobile Right Action Buttons (Language + Reserve + Mobile Menu) */}
          <div className="flex lg:hidden items-center gap-3 shrink-0">
            {/* Mobile Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 font-serif-sc text-[10px] tracking-widest text-white/80 font-medium hover:text-[#5eb3e4] transition-colors px-1 py-1"
              >
                <Globe size={13} className="text-[#5eb3e4]" /> {currentLang}
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-[#091a28] border border-[#5eb3e4]/30 shadow-xl py-2 flex flex-col z-50 backdrop-blur-md">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code, lang.gtCode)}
                      className={`text-left px-4 py-2 font-serif text-sm transition-colors ${currentLang === lang.code ? "text-[#5eb3e4] font-bold bg-[#1e406d]" : "text-white hover:text-[#5eb3e4] hover:bg-[#1e406d]"}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Reserve Button */}
            <Link
              to="/booking"
              className="font-serif-sc tracking-[0.2em] text-xs px-3 py-1.5 border border-[#5eb3e4]/80 text-white font-semibold hover:bg-[#5eb3e4] hover:text-[#091a28] transition-all duration-300 shadow-sm whitespace-nowrap"
            >
              RESERVE
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(true)}
              className="text-white hover:text-[#5eb3e4] p-2 hover:bg-[#5eb3e4]/10 rounded-sm transition-colors"
              aria-label="Open palace menu"
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </header>

      {/* Royal Mobile Drawer */}
      {open && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-50 lg:hidden bg-background marble-texture text-foreground overflow-hidden"
        >
          <div className="absolute inset-0 lattice-pattern opacity-[0.03] dark:opacity-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
            <div className="font-serif-sc text-gold font-medium text-[11px] tracking-[0.5em]">★ THE PALACE ★</div>
            <button
              onClick={() => setOpen(false)}
              className="text-foreground hover:text-gold transition-colors p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div ref={itemsRef} className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 px-6 bg-[#0b2038] text-white">
            {[...leftNavLinks, ...rightNavLinks].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="m-link font-display text-2xl md:text-3xl tracking-widest text-white hover:text-[#5eb3e4] transition-colors duration-500"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="m-link divider-gold w-32 mt-2"><span className="text-[#5eb3e4]">❖</span></div>
            <Link
              to="/booking"
              className="m-link mt-2 px-10 py-4 bg-gradient-to-r from-[#5eb3e4] to-[#2563eb] text-white font-bold font-serif-sc tracking-[0.3em] text-sm shadow-md hover:-translate-y-1 transition-transform duration-500"
            >
              RESERVE A CHAMBER
            </Link>

            {/* Language Switcher Mobile */}
            <div className="m-link mt-6 flex gap-4">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code, lang.gtCode)}
                  className={`font-serif-sc text-xs tracking-widest transition-colors ${currentLang === lang.code ? "text-[#5eb3e4] font-bold border-b border-[#5eb3e4]" : "text-white/70 hover:text-white"}`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
