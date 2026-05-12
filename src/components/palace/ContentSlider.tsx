import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SliderSettings {
  slide_speed?: number;
  transition_type?: 'fade' | 'slide' | 'zoom' | 'parallax';
  autoplay?: boolean;
  pause_on_hover?: boolean;
  show_dots?: boolean;
  show_arrows?: boolean;
  loop?: boolean;
  easing?: string;
}

interface ContentSliderProps {
  images: string[];
  settings?: SliderSettings;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  overlayText?: string;
  overlayTagline?: string;
}

export const ContentSlider = ({
  images,
  settings,
  autoPlay = true,
  interval = 5000,
  className = "",
  overlayText,
  overlayTagline,
}: ContentSliderProps) => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const finalAutoPlay = settings?.autoplay ?? autoPlay;
  const finalInterval = settings?.slide_speed || interval;
  const pauseOnHover = settings?.pause_on_hover ?? true;
  const transitionType = settings?.transition_type || 'fade';
  const showDots = settings?.show_dots ?? true;
  const showArrows = settings?.show_arrows ?? true;
  const loop = settings?.loop ?? true;

  useEffect(() => {
    if (!finalAutoPlay || images.length <= 1) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, finalInterval);
    return () => clearInterval(timer);
  }, [finalAutoPlay, images.length, finalInterval, isHovered, pauseOnHover]);

  const next = () => {
    if (!loop && index === images.length - 1) return;
    setIndex((prev) => (prev + 1) % images.length);
  };
  
  const prev = () => {
    if (!loop && index === 0) return;
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return <div className={`bg-gold/5 flex items-center justify-center font-display text-gold/20 ${className}`}>NO IMAGES</div>;
  }

  const getTransitionVariants = () => {
    switch (transitionType) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 1.1 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        };
      case 'parallax':
        return {
          initial: { opacity: 0, x: 50, scale: 1.05 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: -50, scale: 1.05 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getTransitionVariants();

  return (
    <div 
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: transitionType === 'fade' ? 1.5 : 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={images[index]}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 pointer-events-none" />
      
      {(overlayText || overlayTagline) && (
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10 pointer-events-none">
          {overlayTagline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif-sc text-gold tracking-[0.4em] text-[10px] mb-2 uppercase"
            >
              {overlayTagline}
            </motion.div>
          )}
          {overlayText && (
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-3xl md:text-4xl text-foreground"
            >
              {overlayText}
            </motion.h3>
          )}
        </div>
      )}

      {/* Navigation */}
      {images.length > 1 && showArrows && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gold/20 bg-background/20 backdrop-blur-sm text-gold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-royal-deep duration-300 z-20 ${!loop && index === 0 ? 'hidden' : ''}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-gold/20 bg-background/20 backdrop-blur-sm text-gold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-royal-deep duration-300 z-20 ${!loop && index === images.length - 1 ? 'hidden' : ''}`}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Pagination */}
      {images.length > 1 && showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "bg-gold w-6 shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-gold/30 hover:bg-gold/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
