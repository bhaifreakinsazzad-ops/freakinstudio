/**
 * Obsidian Atelier Design Tokens
 *
 * This file defines the core design tokens used throughout the UI.
 * Tokens are mapped to Tailwind via tailwind.config.ts.
 * Adjust the values to match the official Obsidian Atelier spec.
 */

export const designTokens: Record<string, string> = {
  // Colors
  'color-primary': '#1E3A8A', // example primary (indigo-900)
  'color-primary-foreground': '#FFFFFF',
  'color-secondary': '#64748B', // slate-500
  'color-secondary-foreground': '#FFFFFF',
  'color-success': '#10B981', // emerald-500
  'color-success-foreground': '#FFFFFF',
  'color-danger': '#EF4444', // red-500
  'color-danger-foreground': '#FFFFFF',
  'color-warning': '#F59E0B', // amber-500
  'color-warning-foreground': '#FFFFFF',
  // Grayscale
  'color-gray-50': '#F9FAFB',
  'color-gray-100': '#F3F4F6',
  'color-gray-200': '#E5E7EB',
  'color-gray-300': '#D1D5DB',
  'color-gray-400': '#9CA3AF',
  'color-gray-500': '#6B7280',
  'color-gray-600': '#4B5563',
  'color-gray-700': '#374151',
  'color-gray-800': '#1F2937',
  'color-gray-900': '#111827',

  // Spacing
  'spacing-sm': '0.5rem',
  'spacing-md': '1rem',
  'spacing-lg': '2rem',
  'spacing-xl': '4rem',

  // Border radius
  'radius-sm': '0.25rem',
  'radius-md': '0.5rem',
  'radius-lg': '1rem',

  // Shadows
  'shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
  'shadow-md': '0 4px 6px rgba(0,0,0,0.10)',
  'shadow-lg': '0 10px 15px rgba(0,0,0,0.15)',

  // Typography (example)
  'font-family-sans': '"Inter", system-ui, sans-serif',
  'font-size-base': '1rem',
  'font-size-lg': '1.125rem',
  'line-height-base': '1.5',
};
