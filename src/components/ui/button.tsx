import React from 'react';

/**
 * Button component styled with Obsidian Atelier design tokens via Tailwind.
 *
 * Props are intentionally simple – you can extend as needed.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant – allow any string to stay compatible with existing code */
  variant?: string | 'primary';
  /** Size token (e.g., "sm", "md", "lg") – optional */
  size?: string;
  /** Optional render prop for custom content */
  render?: React.ReactNode;
  /** Optional className to extend/customize the button */
  className?: string;
  /** Button content – either children or render prop must be provided */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  render,
  ...rest
}) => {
  // Tailwind classes map to the designTokens defined in tailwind.config.ts.
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
  }[variant];

  const spacingClasses = 'px-4 py-2'; // using Tailwind default spacing
  const radiusClasses = 'rounded-md'; // will use @theme radius-md
  const shadowClasses = 'shadow-sm'; // uses @theme shadow-sm


  const classes = `${baseClasses} ${variantClasses} ${spacingClasses} ${radiusClasses} ${shadowClasses} ${className}`
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button className={classes} {...rest}>
      {render ?? children}
    </button>
  );
};
