/** @type {import('tailwindcss').Config} */
function withOpacity(varName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${varName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${varName})`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: withOpacity('--border'),
        input: withOpacity('--input'),
        ring: withOpacity('--ring'),
        background: withOpacity('--background'),
        foreground: withOpacity('--foreground'),
        primary: {
          DEFAULT: withOpacity('--primary'),
          foreground: withOpacity('--primary-foreground'),
        },
        secondary: {
          DEFAULT: withOpacity('--secondary'),
          foreground: withOpacity('--secondary-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('--destructive'),
          foreground: withOpacity('--destructive-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('--muted'),
          foreground: withOpacity('--muted-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('--accent'),
          foreground: withOpacity('--accent-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('--popover'),
          foreground: withOpacity('--popover-foreground'),
        },
        card: {
          DEFAULT: withOpacity('--card'),
          foreground: withOpacity('--card-foreground'),
        },
      },
      outlineColor: {
        ring: withOpacity('--ring'),
      },
      fontFamily: {
        sans: ['var(--font-sans, "Inter")', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: "calc(var(--radius, 0.875rem) - 0.375rem)",
        md: "calc(var(--radius, 0.875rem) - 0.25rem)",
        lg: "var(--radius, 0.875rem)",
        xl: "calc(var(--radius, 0.875rem) + 0.25rem)",
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs, 0 1px 2px 0 rgb(0 0 0 / 0.03))',
        'xs': 'var(--shadow-xs, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        'sm': 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'pillow-primary': 'var(--shadow-pillow-primary)',
        'pillow-primary-hover': 'var(--shadow-pillow-primary-hover)',
        'pillow-secondary': 'var(--shadow-pillow-secondary)',
        'pillow-secondary-hover': 'var(--shadow-pillow-secondary-hover)',
        'pillow-destructive': 'var(--shadow-pillow-destructive)',
        'pillow-destructive-hover': 'var(--shadow-pillow-destructive-hover)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
