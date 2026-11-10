import React from 'react';

/**
 * BrandLogo component – renders the studio's logo.
 * Uses a standard img element for simplicity and type safety.
 */
export const BrandLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { className?: string; size?: number; }> = ({ className, size = 48, ...props }) => {
  return (
    <img
      src="/assets/logo.png"
      alt="Freakin's Studio brand logo"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};
