/**
 * Freakin's Studio — Official Brand Book v1.0 Design Tokens
 *
 * Official Non-Negotiable Core Palette:
 * - Obsidian: #090A0A
 * - Champagne Gold: #D9BD81
 * - Studio Ivory: #F6F4EF
 * - Graphite: #232528
 */

export const BRAND_TOKENS = {
  obsidian: "#090A0A",
  champagneGold: "#D9BD81",
  ivory: "#F6F4EF",
  graphite: "#232528",
  contacts: {
    whatsappDisplay: "+8801778307704",
    whatsappHref: "https://wa.me/8801778307704",
    email: "bhaifreakinstudio@gmail.com",
    website: "freakinstudio.space",
    websiteHref: "https://freakinstudio.space",
  },
} as const;

export const designTokens: Record<string, string> = {
  // Core Official Palette
  "color-background": "#090A0A",
  "color-obsidian": "#090A0A",
  "color-champagne-gold": "#D9BD81",
  "color-ivory": "#F6F4EF",
  "color-graphite": "#232528",
  "color-surface": "#121315",
  "color-raised-surface": "#232528",
  "color-primary-text": "#F6F4EF",
  "color-secondary-text": "#A6A49E",
  "color-champagne-accent": "#D9BD81",
  "color-deep-gold-accent": "#B89B5E",
  "color-porcelain-surface": "#F6F4EF",
  "color-border": "#232528",
  // Spacing
  "spacing-sm": "0.5rem",
  "spacing-md": "1rem",
  "spacing-lg": "2rem",
  "spacing-xl": "4rem",
  // Border radius
  "radius-sm": "0.25rem",
  "radius-md": "0.5rem",
  "radius-lg": "1rem",
  // Shadows
  "shadow-sm": "0 1px 2px rgba(0,0,0,0.25)",
  "shadow-md": "0 4px 12px rgba(0,0,0,0.35)",
  "shadow-lg": "0 14px 32px rgba(0,0,0,0.55)",
  // Typography
  "font-family-sans": '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
  "font-family-display": '"Syne", "Space Grotesk", system-ui, sans-serif',
  "font-family-mono": '"JetBrains Mono", monospace',
  "font-size-base": "1rem",
  "font-size-lg": "1.125rem",
  "line-height-base": "1.5",
};