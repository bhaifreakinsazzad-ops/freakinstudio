import type { Config } from 'tailwindcss';
import { designTokens } from './src/lib/designTokens';

/** Map design token colors (e.g., "color-primary": "#123456") to Tailwind palette */
const mapColors = (tokens: Record<string, string>) => {
  const colors: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('color-')) {
      const name = key.replace('color-', '');
      colors[name] = value;
    }
  }
  return colors;
};

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: mapColors(designTokens),
      spacing: {
        sm: designTokens['spacing-sm'] ?? '0.5rem',
        md: designTokens['spacing-md'] ?? '1rem',
        lg: designTokens['spacing-lg'] ?? '2rem',
      },
      borderRadius: {
        sm: designTokens['radius-sm'] ?? '0.25rem',
        md: designTokens['radius-md'] ?? '0.5rem',
        lg: designTokens['radius-lg'] ?? '1rem',
      },
      boxShadow: {
        sm: designTokens['shadow-sm'] ?? '0 1px 2px rgba(0,0,0,0.05)',
        md: designTokens['shadow-md'] ?? '0 4px 6px rgba(0,0,0,0.1)',
        lg: designTokens['shadow-lg'] ?? '0 10px 15px rgba(0,0,0,0.15)',
      },
      screens: {
        xl: { max: '1250px' },
        lg: { max: '1040px' },
        md: { max: '720px' },
        sm: { max: '390px' },
      },
    },
  },
  plugins: [],
};

export default config;
