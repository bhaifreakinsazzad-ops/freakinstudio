"use client";
import * as React from "react";
import { cn } from "cn";

/**
 * Card component styled with Obsidian Atelier design tokens.
 * Supports two size variants: "default" and "sm".
 */
interface CardProps extends React.ComponentProps<"div"> {
  /** Size variant */
  size?: "default" | "sm";
  /** Additional className */
  className?: string;
}

export const Card: React.FC<CardProps> = ({ size = "default", className = "", ...props }) => {
  const baseClasses =
    "group/card flex flex-col overflow-hidden rounded-xl bg-brand-surface/40 text-brand-muted border border-brand-border ring-1 ring-brand-border";

  const spacing = size === "sm" ? "p-4" : "p-6";

  const classes = cn(baseClasses, spacing, className);

  return <div data-slot="card" data-size={size} className={classes} {...props} />;
};

/** CardHeader */
export const CardHeader: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div data-slot="card-header" className={cn("px-4 pt-4", className)} {...props} />
);

/** CardTitle */
export const CardTitle: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div data-slot="card-title" className={cn("font-heading text-base font-medium text-brand-light", className)} {...props} />
);

/** CardDescription */
export const CardDescription: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div data-slot="card-description" className={cn("text-sm text-brand-muted", className)} {...props} />
);

/** CardContent */
export const CardContent: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div data-slot="card-content" className={cn("px-4 py-2", className)} {...props} />
);

/** CardAction */
export const CardAction: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div data-slot="card-action" className={cn("self-end", className)} {...props} />
);

/** CardFooter */
export const CardFooter: React.FC<React.ComponentProps<"div">> = ({ className = "", ...props }) => (
  <div
    data-slot="card-footer"
    className={cn("flex items-center border-t bg-muted/50 p-4", className)}
    {...props}
  />
);
