import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface ThemeConfig {
  id: string;
  name: string;
  background: string;
  foreground: string;
  card: string;
  cardFg: string;
  primary: string;
  gold: string;
  navbarBg?: string;
  navbarFg?: string;
  footerBg?: string;
  footerFg?: string;
  isCustom?: boolean;
}

export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: "desert-sandstone",
    name: "Thar Desert Sandstone & Ochre",
    background: "#f7efe2",
    foreground: "#3b260f",
    card: "#fffdf9",
    cardFg: "#3b260f",
    primary: "#b45309",
    gold: "#d97706",
  },
  {
    id: "blue-cream",
    name: "Royal Blue & Sandstone Cream",
    background: "#faf6f0",
    foreground: "#091a28",
    card: "#ffffff",
    cardFg: "#091a28",
    primary: "#145992",
    gold: "#b45309",
  },
  {
    id: "black-sky",
    name: "Midnight Black & Sky Blue",
    background: "#070b12",
    foreground: "#f0f9ff",
    card: "#0f172a",
    cardFg: "#f8fafc",
    primary: "#0284c7",
    gold: "#38bdf8",
  },
  {
    id: "dark-light-blue",
    name: "Deep Indigo Navy & Powder Sky",
    background: "#091a28",
    foreground: "#e0f2fe",
    card: "#0e2a47",
    cardFg: "#ffffff",
    primary: "#38bdf8",
    gold: "#7dd3fc",
  },
  {
    id: "royal-gold",
    name: "Palace Gold & Midnight Blue",
    background: "#081420",
    foreground: "#fffbeb",
    card: "#0d2238",
    cardFg: "#fef3c7",
    primary: "#d4af37",
    gold: "#f59e0b",
  },
  {
    id: "emerald-ivory",
    name: "Royal Emerald & Warm Ivory",
    background: "#f7f9f6",
    foreground: "#062c1b",
    card: "#ffffff",
    cardFg: "#062c1b",
    primary: "#047857",
    gold: "#d4af37",
  },
  {
    id: "ruby-maroon",
    name: "Rajput Ruby Maroon & Sandstone",
    background: "#faf4f0",
    foreground: "#4a0e17",
    card: "#ffffff",
    cardFg: "#4a0e17",
    primary: "#9f1239",
    gold: "#eab308",
  },
  {
    id: "sunset-terracotta",
    name: "Jodhpur Sunset Terracotta",
    background: "#faf2eb",
    foreground: "#431407",
    card: "#ffffff",
    cardFg: "#431407",
    primary: "#c2410c",
    gold: "#f59e0b",
  },
  {
    id: "amethyst-purple",
    name: "Royal Amethyst Purple & Gold",
    background: "#0f0919",
    foreground: "#faf5ff",
    card: "#1e1035",
    cardFg: "#ffffff",
    primary: "#9333ea",
    gold: "#f59e0b",
  },
  {
    id: "sapphire-silver",
    name: "Deep Sapphire & Platinum Silver",
    background: "#f1f5f9",
    foreground: "#0f172a",
    card: "#ffffff",
    cardFg: "#0f172a",
    primary: "#1e40af",
    gold: "#64748b",
  },
];

export const hexToHSL = (hex: string): string => {
  if (!hex) return "40 30% 97%";
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return "40 30% 97%";

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
};

export const applyThemeToDOM = (theme: ThemeConfig) => {
  if (!theme) return;
  const root = document.documentElement;

  // Set HSL values for Tailwind CSS variables
  root.style.setProperty("--background", hexToHSL(theme.background));
  root.style.setProperty("--foreground", hexToHSL(theme.foreground));
  root.style.setProperty("--card", hexToHSL(theme.card));
  root.style.setProperty("--card-foreground", hexToHSL(theme.cardFg || theme.foreground));
  root.style.setProperty("--primary", hexToHSL(theme.primary));
  root.style.setProperty("--gold", hexToHSL(theme.gold));

  // Set raw hex values for direct style overrides
  root.style.setProperty("--custom-bg", theme.background);
  root.style.setProperty("--custom-fg", theme.foreground);
  root.style.setProperty("--custom-card", theme.card);
  root.style.setProperty("--custom-card-fg", theme.cardFg || theme.foreground);
  root.style.setProperty("--custom-primary", theme.primary);
  root.style.setProperty("--custom-gold", theme.gold);

  // Set navbar and footer colors
  if (theme.navbarBg) root.style.setProperty("--custom-navbar-bg", theme.navbarBg);
  else root.style.removeProperty("--custom-navbar-bg");

  if (theme.navbarFg) root.style.setProperty("--custom-navbar-fg", theme.navbarFg);
  else root.style.removeProperty("--custom-navbar-fg");

  if (theme.footerBg) root.style.setProperty("--custom-footer-bg", theme.footerBg);
  else root.style.removeProperty("--custom-footer-bg");

  if (theme.footerFg) root.style.setProperty("--custom-footer-fg", theme.footerFg);
  else root.style.removeProperty("--custom-footer-fg");

  // Directly update body inline background & color
  document.body.style.backgroundColor = theme.background;
  document.body.style.color = theme.foreground;

  root.setAttribute("data-active-theme", theme.id);
  
  // Dispatch custom window event for instant update across components
  window.dispatchEvent(new CustomEvent("themeChanged", { detail: theme }));
};

export const useTheme = () => {
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(PRESET_THEMES[0]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "theme_config")
          .single();

        if (data && data.value) {
          setActiveTheme(data.value);
          applyThemeToDOM(data.value);
        } else {
          applyThemeToDOM(PRESET_THEMES[0]);
        }
      } catch (err) {
        applyThemeToDOM(PRESET_THEMES[0]);
      }
    };

    loadTheme();

    const handleThemeChange = (e: CustomEvent<ThemeConfig>) => {
      if (e.detail) {
        setActiveTheme(e.detail);
      }
    };

    window.addEventListener("themeChanged" as any, handleThemeChange);
    return () => {
      window.removeEventListener("themeChanged" as any, handleThemeChange);
    };
  }, []);

  return { activeTheme, applyThemeToDOM };
};

