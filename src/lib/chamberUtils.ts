export interface ChamberHeadingStyle {
  darkWords?: string;
  lightWords?: string;
}

/**
 * Parses chamber titles into dark serif words and light/accent italic gradient words.
 * Honors explicit CMS settings first, then delimiters (// or |), and falls back
 * to smart detection (e.g. "JUNIOR SUITE" as dark words and "WITH BALCONY" as light words).
 */
export function parseChamberHeading(
  name: string = "",
  customStyle?: ChamberHeadingStyle | null
): { darkWords: string; lightWords: string } {
  const cleanName = (name || "").trim();

  // 1. Explicit CMS configuration
  if (customStyle) {
    const hasDark = customStyle.darkWords !== undefined && customStyle.darkWords !== null && customStyle.darkWords.trim() !== "";
    const hasLight = customStyle.lightWords !== undefined && customStyle.lightWords !== null && customStyle.lightWords.trim() !== "";
    if (hasDark || hasLight) {
      return {
        darkWords: customStyle.darkWords?.trim() || "",
        lightWords: customStyle.lightWords?.trim() || "",
      };
    }
  }

  // 2. Delimiter syntax: "JUNIOR SUITE // WITH BALCONY" or "JUNIOR SUITE | WITH BALCONY"
  if (cleanName.includes("//")) {
    const [d, ...rest] = cleanName.split("//");
    return {
      darkWords: d.trim(),
      lightWords: rest.join("//").trim(),
    };
  }
  if (cleanName.includes("|")) {
    const [d, ...rest] = cleanName.split("|");
    return {
      darkWords: d.trim(),
      lightWords: rest.join("|").trim(),
    };
  }

  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { darkWords: cleanName, lightWords: "" };
  }

  // 3. Smart detection for Suites with extra qualifiers (e.g. "JUNIOR SUITE WITH BALCONY")
  // If the 2nd word is "SUITE" and there are 3+ words, user wants "JUNIOR SUITE" dark, and "WITH BALCONY" light.
  if (words.length >= 3 && words[1].toUpperCase() === "SUITE") {
    return {
      darkWords: words.slice(0, 2).join(" "),
      lightWords: words.slice(2).join(" "),
    };
  }

  // If 3 or more words, take first 2 words as dark and remainder as light
  if (words.length >= 3) {
    return {
      darkWords: words.slice(0, 2).join(" "),
      lightWords: words.slice(2).join(" "),
    };
  }

  // 2 words fallback: word 1 dark, word 2 light
  return {
    darkWords: words[0],
    lightWords: words.slice(1).join(" "),
  };
}
