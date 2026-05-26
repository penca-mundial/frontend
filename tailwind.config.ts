import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

// Tailwind 4 is CSS-first; this config is loaded via `@config` in
// src/styles/globals.css. It holds the class-based dark mode strategy and
// is where shadcn/ui extends the theme tokens (task-022).
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [tailwindcssAnimate],
} satisfies Config
