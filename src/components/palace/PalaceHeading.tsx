import React from "react";

export interface HeadingConfig {
  title?: string;
  title_word_colors?: ("dark" | "light")[] | Record<string | number, "dark" | "light">;
  title_dark_color?: string;
  title_light_color?: string;
  title_use_gradient?: boolean;
}

interface PalaceHeadingProps {
  title: string;
  content?: HeadingConfig | null;
  defaultLightWords?: string[];
  defaultLightPhrase?: string;
  defaultLightIndices?: number[];
  isDarkBg?: boolean;
  className?: string;
}

export const PalaceHeading: React.FC<PalaceHeadingProps> = ({
  title,
  content,
  defaultLightWords,
  defaultLightPhrase,
  defaultLightIndices,
  isDarkBg = false,
  className = "",
}) => {
  if (!title) return null;

  const rawWords = title.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return null;

  // Resolve base dark and light colors
  const defaultDark = isDarkBg ? "#ffffff" : "var(--custom-fg, #091a28)";
  const darkColor = content?.title_dark_color || defaultDark;
  const lightColor = content?.title_light_color || "#d4af37";
  const useGradient =
    content?.title_use_gradient !== false &&
    (!content?.title_light_color ||
      content?.title_light_color === "#d4af37" ||
      content?.title_light_color.toLowerCase() === "gradient");

  const wordColors = content?.title_word_colors;

  const isWordLight = (index: number, word: string): boolean => {
    // 1. Explicit CMS configuration for this word index
    if (wordColors) {
      const explicit = Array.isArray(wordColors)
        ? wordColors[index]
        : (wordColors as any)[index] ?? (wordColors as any)[String(index)];
      if (explicit === "light") return true;
      if (explicit === "dark") return false;
    }

    // 2. Default light indices provided as fallback
    if (defaultLightIndices && defaultLightIndices.includes(index)) {
      return true;
    }

    // 3. Default light words array
    if (defaultLightWords && defaultLightWords.length > 0) {
      const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (defaultLightWords.some((dw) => clean === dw.toLowerCase())) {
        return true;
      }
    }

    // 4. Default light phrase match
    if (defaultLightPhrase) {
      const phraseClean = defaultLightPhrase.toLowerCase();
      const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (phraseClean.includes(clean) && clean.length > 1) {
        return true;
      }
    }

    // 5. Smart fallback when no explicit style or defaults match:
    // Highlight last 1-2 words
    if (rawWords.length >= 3) {
      return index >= rawWords.length - (rawWords.length > 4 ? 2 : 1);
    }
    if (rawWords.length === 2) {
      return index === 1;
    }

    return false;
  };

  return (
    <span className={className}>
      {rawWords.map((word, i) => {
        const isLight = isWordLight(i, word);

        const style: React.CSSProperties = {};
        let spanClass = "";

        if (isLight) {
          spanClass = "italic";
          if (useGradient) {
            spanClass += " text-heritage-gradient";
          } else {
            style.color = lightColor;
          }
        } else {
          style.color = darkColor;
        }

        return (
          <React.Fragment key={i}>
            <span style={style} className={spanClass}>
              {word}
            </span>
            {i < rawWords.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </span>
  );
};
