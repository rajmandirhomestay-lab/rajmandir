import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

interface PageShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export const PageShell = ({ children, title, description }: PageShellProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.setAttribute("rel", "canonical");
      document.head.appendChild(canon);
    }
    canon.setAttribute("href", window.location.origin + pathname);
  }, [title, description, pathname]);

  // cinematic page-in fade
  useEffect(() => {
    const el = document.getElementById("page-root");
    if (!el) return;
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <main id="page-root" className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};
