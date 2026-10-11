import React from "react";

export const TripadvisorIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 22,
  className = ""
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Eyebrows & ears arch */}
      <path
        d="M2 10.5C3.5 8 5.5 7.5 7.5 7.5C9.5 7.5 11 8.5 12 10C13 8.5 14.5 7.5 16.5 7.5C18.5 7.5 20.5 8 22 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Left eye circle */}
      <circle cx="6.5" cy="13.5" r="3.75" stroke="currentColor" strokeWidth="1.6" />
      {/* Right eye circle */}
      <circle cx="17.5" cy="13.5" r="3.75" stroke="currentColor" strokeWidth="1.6" />
      {/* Left pupil */}
      <circle cx="6.5" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
      {/* Right pupil */}
      <circle cx="17.5" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
      {/* Center Beak */}
      <path d="M12 11.2L10.7 13.8H13.3L12 11.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
};
