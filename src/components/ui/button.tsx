"use client";
import React from 'react';

/**
 * Button component styled with Obsidian Atelier design tokens via Tailwind.
 * Supports multiple visual variants.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'outline' | 'ghost' | 'cyberGlow' | string;
  /** Size token (e.g., "sm", "md", "lg") */
  size?: 'sm' | 'md' | 'lg';
  /** Optional render prop for custom content */
  render?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  render,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizeMap: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantMap: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
    outline: 'border border-primary text-primary bg-transparent hover:bg-primary/10',
    ghost: 'bg-transparent text-primary hover:bg-primary/5',
    cyberGlow: 'bg-primary/10 text-primary shadow-[0_0_8px_rgba(255,255,255,0.2)] hover:bg-primary/20',
  };

  const classes = `${baseClasses} ${sizeMap[size] || ''} ${variantMap[variant] || ''} ${className}`
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button className={classes} {...rest}>
      {render ?? children}
    </button>
  );
};
