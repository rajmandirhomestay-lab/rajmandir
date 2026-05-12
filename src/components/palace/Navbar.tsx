import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu, X, Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/lib/supabase";

const defaultLinks = [
  { to: "/rooms", label: "Chambers" },
  { to: "/dining", label: "Dining" },
  { to: "/experiences", label: "Experiences" },
  { to: "/stories", label: "Stories" },
  { to: "/about", label: "Heritage" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [navLinks, setNavLinks] = useState(defaultLinks);
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "EN", name: "English" },
    { code: "HI", name: "Hindi" },
    { code: "FR", name: "Français" },
    { code: "ES", name: "Español" }
  ];

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data } = await supabase.from("settings").select("value").eq("key", "navbar_items").single();
        if (data && data.value && Array.isArray(data.value) && data.value.length > 0) {
          setNavLinks(data.value);
        }
      } catch (err) {
        console.error("Failed to load nav links:", err);
      }
    };
    fetchLinks();
  }, []);

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
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 ${
          scrolled
            ? "backdrop-blur-xl bg-royal-deep/95 border-b border-gold/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "backdrop-blur-md bg-black/40 border-b border-gold/20"
        }`}
      >
        {/* Subtle gold thread under bar */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold transition-transform duration-700 group-hover:rotate-[20deg]">
              <span className="font-display text-royal-deep text-lg font-bold">R</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-white text-lg tracking-wider font-bold drop-shadow-md">Raj Mandir</div>
              <div className="font-serif-sc text-[10px] tracking-[0.4em] text-gold font-bold drop-shadow-md">JODHPUR · 1894</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-xs tracking-[0.3em] transition-colors duration-500 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all after:duration-500 drop-shadow-md ${
                    isActive
                      ? "text-gold font-bold after:w-full"
                      : "text-white font-semibold hover:text-gold after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Language Switcher Desktop */}
            <div className="hidden lg:relative lg:block">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 font-serif-sc text-[10px] tracking-widest text-white font-semibold hover:text-gold transition-colors px-2 py-1 drop-shadow-md"
              >
                <Globe size={14} className="text-gold" /> {currentLang}
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-card border border-gold/20 shadow-xl py-2 flex flex-col z-50 animate-fade-in backdrop-blur-md">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setCurrentLang(lang.code); setLangOpen(false); }}
                      className={`text-left px-4 py-2 font-serif text-sm transition-colors ${currentLang === lang.code ? "text-gold bg-gold/5" : "text-foreground hover:text-gold hover:bg-gold/5"}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/booking"
              className="hidden sm:inline-flex font-serif-sc tracking-[0.2em] text-xs px-5 py-3 rounded-sm bg-gradient-gold text-royal-deep font-semibold hover:shadow-gold hover:-translate-y-0.5 transition-all duration-700"
            >
              RESERVE
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-white hover:text-gold p-2 hover:bg-gold/10 rounded-sm transition-colors drop-shadow-md"
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

          <div ref={itemsRef} className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-7 px-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="m-link font-display text-3xl tracking-widest text-foreground hover:text-gold transition-colors duration-500"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="m-link divider-gold w-32 mt-2"><span className="text-gold">❖</span></div>
            <Link
              to="/booking"
              className="m-link mt-4 px-10 py-4 bg-gradient-gold text-royal-deep font-bold font-serif-sc tracking-[0.3em] text-sm shadow-gold hover:-translate-y-1 transition-transform duration-500"
            >
              RESERVE A CHAMBER
            </Link>
            
            {/* Language Switcher Mobile */}
            <div className="m-link mt-8 flex gap-4">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`font-serif-sc text-[10px] tracking-widest transition-colors ${currentLang === lang.code ? "text-gold border-b border-gold" : "text-muted-foreground hover:text-gold"}`}
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
