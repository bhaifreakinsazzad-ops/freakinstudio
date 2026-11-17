"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Layers } from "lucide-react";

interface ShowcaseImageProps {
  src: string | StaticImageData;
  alt: string;
  caption?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ShowcaseImage({
  src,
  alt,
  caption,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: ShowcaseImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-surface via-brand-card to-brand-black p-6 text-center">
        <Layers className="h-8 w-8 text-brand-highlight/80" aria-hidden="true" />
        <p className="font-mono text-xs font-medium text-brand-light line-clamp-2">
          {caption || alt}
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
