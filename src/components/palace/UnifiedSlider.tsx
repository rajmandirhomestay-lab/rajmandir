import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Parallax, Navigation, Pagination, Keyboard, EffectCoverflow } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type SliderSettings = {
  slide_speed: number;
  transition_type: string;
  autoplay: boolean;
  pause_on_hover: boolean;
  show_dots: boolean;
  show_arrows: boolean;
  loop: boolean;
  animation_duration?: number;
  mobile_swipe?: boolean;
  keyboard_navigation?: boolean;
};

export type UnifiedSliderProps = {
  images?: string[];
  slides?: React.ReactNode[];
  settings: SliderSettings;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  centeredSlides?: boolean;
  slidesPerView?: number | "auto";
  spaceBetween?: number;
  initialSlide?: number;
};

export function UnifiedSlider({
  images,
  slides,
  settings,
  className = "",
  imageClassName = "",
  children,
  overlay = false,
  centeredSlides = false,
  slidesPerView = 1,
  spaceBetween = 0,
  initialSlide = 0,
}: UnifiedSliderProps) {
  const isFade = settings.transition_type === "fade" || settings.transition_type === "crossfade";
  const isParallax = settings.transition_type === "parallax";
  const isCoverflow = settings.transition_type === "coverflow";
  
  const modules = [Pagination, Navigation, Keyboard];
  
  if (settings.autoplay) modules.push(Autoplay);
  if (isFade) modules.push(EffectFade);
  if (isParallax) modules.push(Parallax);
  if (isCoverflow) modules.push(EffectCoverflow);

  return (
    <div className={`relative w-full h-full group ${className}`}>
      <Swiper
        modules={modules}
        effect={isFade ? "fade" : isParallax ? "parallax" : isCoverflow ? "coverflow" : "slide"}
        fadeEffect={isFade ? { crossFade: settings.transition_type === "crossfade" } : undefined}
        coverflowEffect={isCoverflow ? { rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false } : undefined}
        speed={settings.animation_duration || 1000}
        loop={settings.loop}
        initialSlide={initialSlide}
        centeredSlides={centeredSlides}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        allowTouchMove={settings.mobile_swipe !== false}
        keyboard={settings.keyboard_navigation !== false ? { enabled: true } : false}
        autoplay={
          settings.autoplay
            ? {
                delay: settings.slide_speed || 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: settings.pause_on_hover,
              }
            : false
        }
        pagination={settings.show_dots ? { clickable: true } : false}
        navigation={settings.show_arrows}
        className="w-full h-full"
        parallax={isParallax}
      >
        {isParallax && (
          <div
            slot="container-start"
            className="parallax-bg absolute inset-0 w-full h-full"
            data-swiper-parallax="-23%"
          ></div>
        )}
        
        {slides ? (
          slides.map((slideContent, idx) => (
            <SwiperSlide key={idx} className="w-full h-full relative">
              {slideContent}
            </SwiperSlide>
          ))
        ) : images ? (
          images.map((img, idx) => (
            <SwiperSlide key={idx} className="w-full h-full relative overflow-hidden">
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`w-full h-full object-cover select-none ${imageClassName}`}
                data-swiper-parallax={isParallax ? "-20%" : undefined}
              />
              {overlay && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
              {settings.transition_type === 'zoom' && (
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .swiper-slide-active img {
                      animation: zoomEffect ${settings.slide_speed + (settings.animation_duration || 1000)}ms linear infinite alternate;
                    }
                    @keyframes zoomEffect {
                      from { transform: scale(1); }
                      to { transform: scale(1.1); }
                    }
                  `
                }} />
              )}
            </SwiperSlide>
          ))
        ) : null}
        {children && <div className="absolute inset-0 z-10 pointer-events-none">{children}</div>}
      </Swiper>
    </div>
  );
}
