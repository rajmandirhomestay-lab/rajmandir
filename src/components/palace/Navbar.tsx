import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu, X, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

const leftNavLinks = [
  { to: "/rooms", label: "CHAMBERS" },
  { to: "/dining", label: "FEASTS" },
  { to: "/experiences", label: "CHRONICLES" },
  { to: "/attractions", label: "WONDERS" },
];

const rightNavLinks = [
  { to: "/stories", label: "JOURNEYS" },
  { to: "/day-at-raj-mandir", label: "RITUALS" },
  { to: "/corner", label: "CORNER" },
  { to: "/about", label: "LEGACY" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "site_logo")
      .single()
      .then(({ data }) => {
        if (data?.value) setSiteLogo(data.value);
      })
      .catch(() => {});
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
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 backdrop-blur-xl border-b border-gold/30 shadow-xl ${
          scrolled ? "opacity-95" : "opacity-90"
        }`}
        style={{
          backgroundColor: 'var(--custom-navbar-bg, #091a28)',
          color: 'var(--custom-navbar-fg, #ffffff)'
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="relative mx-auto max-w-[1750px] px-3 md:px-6 py-4 flex items-center justify-between min-h-[80px]">

          {/* Desktop Left Corner Logo */}
          {siteLogo && (
            <Link to="/" className="hidden lg:flex items-center shrink-0 mr-2 xl:mr-4 group">
              <img src={siteLogo} alt="Site Logo" className="h-10 xl:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
          )}

          {/* Mobile Logo Left */}
          <Link to="/" className="flex lg:hidden items-center gap-2">
            {siteLogo ? (
              <img src={siteLogo} alt="Site Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex flex-col">
                <span className="font-serif-sc text-[8px] tracking-[0.35em] text-gold uppercase font-semibold">THE</span>
                <span className="font-display text-white text-base tracking-wider font-bold">RAJ MANDIR</span>
              </div>
            )}
          </Link>

          {/* Desktop Left Nav Links (4 Links) */}
          <nav className="hidden lg:flex items-center justify-end gap-1.5 lg:gap-3 xl:gap-5 flex-1 min-w-0 pr-2 lg:pr-3 xl:pr-5">
            {leftNavLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-[10px] lg:text-[11px] xl:text-xs tracking-wider xl:tracking-[0.16em] whitespace-nowrap shrink-0 transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all after:duration-300 ${isActive
                    ? "text-gold font-bold after:w-full"
                    : "text-white/90 font-medium hover:text-gold after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          {/* CENTER LOGO TYPOGRAPHY */}
          <Link
            to="/"
            className="hidden lg:flex flex-col items-center justify-center text-center shrink-0 px-2 lg:px-4 xl:px-6 group select-none"
          >
            <div className="font-serif-sc text-[7px] lg:text-[8px] tracking-[0.4em] text-gold uppercase font-semibold mb-0.5">THE</div>
            <div className="font-display text-white text-base lg:text-lg xl:text-xl tracking-[0.18em] xl:tracking-[0.2em] font-bold drop-shadow-sm leading-tight transition-colors group-hover:text-gold whitespace-nowrap">
              RAJ MANDIR
            </div>
            <div className="font-serif-sc text-[7px] lg:text-[8px] tracking-[0.4em] text-gold uppercase font-semibold mt-0.5">
              HERITAGE HOTEL
            </div>
          </Link>

          {/* Desktop Right Nav Items (4 Links) */}
          <div className="hidden lg:flex items-center justify-start gap-1.5 lg:gap-3 xl:gap-5 flex-1 min-w-0 pl-2 lg:pl-3 xl:pl-5">
            {rightNavLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-[10px] lg:text-[11px] xl:text-xs tracking-wider xl:tracking-[0.16em] whitespace-nowrap shrink-0 transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all after:duration-300 ${isActive
                    ? "text-gold font-bold after:w-full"
                    : "text-white/90 font-medium hover:text-gold after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </div>

          {/* DESKTOP FAR RIGHT CORNER RESERVE BUTTON */}
          <div className="hidden lg:flex items-center shrink-0 ml-4 xl:ml-6">
            <Link
              to="/booking"
              className="font-serif-sc tracking-wider xl:tracking-[0.18em] text-[10px] lg:text-[11px] xl:text-xs px-3.5 lg:px-4 xl:px-5 py-2 border border-heritage-brown text-white bg-heritage-brown font-bold hover:bg-heritage-orange hover:border-heritage-orange hover:scale-[1.03] transition-all duration-300 shadow-md whitespace-nowrap shrink-0 rounded-sm"
            >
              RESERVE
            </Link>
          </div>

          {/* Mobile Right Action Buttons */}
          <div className="flex lg:hidden items-center gap-3 shrink-0">
            <Link
              to="/booking"
              className="font-serif-sc tracking-[0.2em] text-xs px-3 py-1.5 border border-heritage-brown text-white bg-heritage-brown font-bold hover:bg-heritage-orange transition-all duration-300 shadow-sm whitespace-nowrap rounded-sm"
            >
              RESERVE
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="text-white hover:text-gold p-2 hover:bg-gold/10 rounded-sm transition-colors"
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

          <div ref={itemsRef} className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 px-6 bg-royal-deep text-white">
            {[...leftNavLinks, ...rightNavLinks].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="m-link font-display text-2xl md:text-3xl tracking-widest text-white hover:text-gold transition-colors duration-500"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="m-link divider-gold w-32 mt-2"><span className="text-gold">❖</span></div>
            <Link
              to="/booking"
              className="m-link mt-2 px-10 py-4 bg-heritage-brown text-white border border-heritage-orange font-bold font-serif-sc tracking-[0.3em] text-sm shadow-md hover:bg-heritage-orange hover:-translate-y-1 transition-all duration-500 rounded-sm"
            >
              RESERVE A CHAMBER
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
