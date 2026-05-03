import { useMemo } from "react";

export const DustParticles = ({ count = 30 }: { count?: number }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 4 + 1.5;
        return {
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${80 + Math.random() * 30}%`,
          size,
          duration: 18 + Math.random() * 22,
          delay: -Math.random() * 25,
          tx: `${(Math.random() - 0.5) * 120}px`,
          opacity: 0.3 + Math.random() * 0.6,
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="dust-particle animate-float-dust"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // @ts-expect-error custom prop
            "--tx": p.tx,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};
