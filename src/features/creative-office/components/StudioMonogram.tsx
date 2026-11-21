"use client";

import { useEffect, useRef } from "react";
import { drawSvgPaths, getSpringEase, runKinetic } from "../utils/motion";

export function StudioMonogram({
  size = 36,
  interactive = false,
  reducedMotion = false,
}: {
  size?: number;
  interactive?: boolean;
  reducedMotion?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !svgRef.current) return;
    const strokes = svgRef.current.querySelectorAll<SVGGeometryElement>(
      ".fs-monogram-stroke"
    );
    drawSvgPaths(strokes, 1100, 140);
  }, [reducedMotion]);

  const handleHoverPulse = () => {
    if (reducedMotion || !svgRef.current) return;
    runKinetic(svgRef.current, {
      scale: [1, 1.1, 1],
      rotate: [0, -4, 0],
      duration: 480,
      ease: getSpringEase(),
    });
  };

  return (
    <svg
      ref={svgRef}
      onMouseEnter={interactive ? handleHoverPulse : undefined}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Freakin's Studio Official Monogram"
      className="shrink-0"
    >
      <rect
        className="fs-monogram-stroke"
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="10"
        fill="#090A0A"
        stroke="#D9BD81"
        strokeWidth="1.75"
      />
      <path d="M14 13H34V17.5H19V22H31V26.5H19V35H14V13Z" fill="#D9BD81" />
      <path d="M24 29.5H34V35H24V29.5Z" fill="#F6F4EF" />
    </svg>
  );
}
