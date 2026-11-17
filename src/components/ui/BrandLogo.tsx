import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

/**
 * Geometric obsidian-and-champagne-gold emblem for Freakin's Studio.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  size = 36,
  showWordmark = false,
}) => {
  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-brand-highlight/50 bg-brand-surface p-1.5 shadow-sm"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="fs-gold-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="55%" stopColor="#d9bd81" />
              <stop offset="100%" stopColor="#f5e3b3" />
            </linearGradient>
          </defs>
          <path
            d="M50 10 L90 86 H70 L50 44 L30 86 H10 Z"
            fill="url(#fs-gold-grad)"
          />
          <polygon points="50,30 72,76 28,76" fill="#d9bd81" opacity="0.45" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-mono text-sm font-bold tracking-wider text-brand-light whitespace-nowrap">
          FREAKIN&apos;S STUDIO
        </span>
      )}
    </span>
  );
};
