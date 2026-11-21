import React from "react";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Official Freakin's Studio Monogram (FS / FRAME / PLAY)
 * Approved Brand Book v1.0 Palette:
 * - Obsidian: #090A0A
 * - Champagne Gold: #D9BD81
 * - Studio Ivory: #F6F4EF
 * - Graphite: #232528
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  showText = true,
  showTagline = true,
  size = "md",
}) => {
  const iconDimensions =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={iconDimensions}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Freakin's Studio Official FS Frame Play Monogram"
        >
          {/* Outer Obsidian Plate & Champagne Gold Frame */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="10"
            fill="#090A0A"
            stroke="#D9BD81"
            strokeWidth="1.6"
          />
          <rect
            x="6.5"
            y="6.5"
            width="35"
            height="35"
            rx="6"
            stroke="#232528"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Corner Frame Registration Ticks */}
          <path
            d="M11 8H8V11M37 8H40V11M11 40H8V37M37 40H40V37"
            stroke="#D9BD81"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* F Stem & Bars in Studio Ivory */}
          <path
            d="M14 14H25V17.5H17.8V22.2H23.8V25.5H17.8V34H14V14Z"
            fill="#F6F4EF"
          />
          {/* S Geometric Ribbon + Play Wedge in Champagne Gold */}
          <path
            d="M27.5 14H35.5V17.5H30.2V21.5H35.5C36.6 21.5 37.5 22.4 37.5 23.5V32C37.5 33.1 36.6 34 35.5 34H26.8V30.5H33.8V25H28.5C27.4 25 26.5 24.1 26.5 23V15C26.5 14.4 26.9 14 27.5 14Z"
            fill="#D9BD81"
          />
          {/* Precision Play Vector Node */}
          <polygon points="22,26.8 25.6,29 22,31.2" fill="#D9BD81" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold tracking-[0.14em] text-sm sm:text-base text-[#F6F4EF]">
            FREAKIN&apos;S <span className="text-[#D9BD81]">STUDIO</span>
          </span>
          {showTagline && (
            <span className="font-mono text-[9px] tracking-[0.22em] text-[#F6F4EF]/65 uppercase mt-1">
              DESIGN. CREATE. PRODUCE. GROW.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
