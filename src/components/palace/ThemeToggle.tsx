import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle palace day / night"
      className="group relative h-11 w-11 rounded-full border border-gold/40 bg-card/60 backdrop-blur-md flex items-center justify-center transition-all duration-700 hover:shadow-gold hover:border-gold"
    >
      <Sun className={`absolute h-5 w-5 text-gold transition-all duration-700 ${dark ? "opacity-0 rotate-90 scale-50" : "opacity-100"}`} />
      <Moon className={`absolute h-5 w-5 text-gold transition-all duration-700 ${dark ? "opacity-100" : "opacity-0 -rotate-90 scale-50"}`} />
    </button>
  );
};
