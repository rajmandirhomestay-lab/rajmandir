import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
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
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

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
          scrolled || !isHome
            ? "backdrop-blur-md bg-background/70 border-b border-gold/20"
            : "bg-transparent"
        }`}
      >
        {/* Subtle gold thread under bar */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold transition-transform duration-700 group-hover:rotate-[20deg]">
              <span className="font-display text-royal-deep text-lg">R</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-foreground text-lg tracking-wider">Raj Mandir</div>
              <div className="font-serif-sc text-[10px] tracking-[0.4em] text-gold">JODHPUR · 1894</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-serif-sc text-xs tracking-[0.3em] transition-colors duration-500 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all after:duration-500 ${
                    isActive
                      ? "text-gold after:w-full"
                      : "text-foreground/80 hover:text-gold after:w-0 hover:after:w-full"
                  }`
                }
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/booking"
              className="hidden sm:inline-flex font-serif-sc tracking-[0.2em] text-xs px-5 py-3 rounded-sm bg-gradient-gold text-royal-deep hover:shadow-gold transition-all duration-700"
            >
              RESERVE
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-sm transition-colors"
              aria-label="Open palace menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Royal Mobile Drawer */}
      {open && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-50 lg:hidden bg-gradient-night text-ivory overflow-hidden"
        >
          <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
            <div className="font-serif-sc text-gold text-[11px] tracking-[0.5em]">★ THE PALACE ★</div>
            <button
              onClick={() => setOpen(false)}
              className="text-gold p-2"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div ref={itemsRef} className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-7 px-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="m-link font-display text-3xl tracking-widest text-ivory hover:text-gold transition-colors duration-500"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="m-link divider-gold w-32 mt-2"><span className="text-gold">❖</span></div>
            <Link
              to="/booking"
              className="m-link mt-4 px-10 py-4 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-sm shadow-gold"
            >
              RESERVE A CHAMBER
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
