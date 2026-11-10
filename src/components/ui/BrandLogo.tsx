import React from 'react';

/**
 * BrandLogo component – renders the studio's logo.
 * Uses a standard img element for simplicity and type safety.
 */
export const BrandLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { className?: string }> = ({ className, ...props }) => {
  return (
    <img
      src="/assets/logo.png"
      alt="Freakin's Studio brand logo"
      width={48}
      height={48}
      className={className}
      {...props}
    />
  );
};
