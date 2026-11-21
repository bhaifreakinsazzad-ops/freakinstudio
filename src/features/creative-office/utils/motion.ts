"use client";

import { createElement, useEffect, useRef, useState } from "react";
import {
  animate as animeV4Animate,
  createTimeline as animeV4Timeline,
  stagger as animeV4Stagger,
  svg as animeV4Svg,
  spring as animeV4Spring,
  type AnimationParams,
  type TargetsParam,
} from "animejs";

export { animeV4Timeline };

export function runKinetic(
  targets: TargetsParam | null | undefined,
  params: AnimationParams
) {
  if (!targets) return null;
  try {
    return animeV4Animate(targets, params);
  } catch {
    return null;
  }
}

export function getStagger(
  val: number,
  opts?: { start?: number; from?: "first" | "last" | "center" }
) {
  return animeV4Stagger(val, opts);
}

export function getSpringEase() {
  try {
    return animeV4Spring({ stiffness: 280, damping: 16 });
  } catch {
    return "outElastic(1, .6)";
  }
}

export function drawSvgPaths(
  elements: NodeListOf<SVGGeometryElement> | Element[] | string | null,
  duration = 1100,
  delayStep = 140
) {
  if (!elements) return;
  if (typeof elements !== "string" && elements.length === 0) return;
  try {
    const drawables = animeV4Svg.createDrawable(elements);
    animeV4Animate(drawables, {
      draw: ["0 0", "0 1"],
      duration,
      delay: getStagger(delayStep),
      ease: "inOutQuad",
    });
  } catch {
    // Keep static stroke intact on fallback
  }
}

export function getDhakaTimestamp(): string {
  try {
    return (
      new Date().toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " +06"
    );
  } catch {
    return new Date().toISOString();
  }
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  reducedMotion = false,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  reducedMotion?: boolean;
}) {
  const [displayVal, setDisplayVal] = useState(value);
  const proxyRef = useRef({ val: value });

  useEffect(() => {
    if (reducedMotion) {
      proxyRef.current.val = value;
      return;
    }
    const anim = runKinetic(proxyRef.current, {
      val: value,
      duration: 550,
      ease: "outExpo",
      onUpdate: () => {
        setDisplayVal(Number(proxyRef.current.val.toFixed(decimals)));
      },
    });
    return () => {
      if (anim && typeof anim.pause === "function") anim.pause();
    };
  }, [value, decimals, reducedMotion]);

  const shownVal = reducedMotion ? value : displayVal;
  return createElement("span", null, `${shownVal}${suffix}`);
}
