/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AutoCAD-inspired dark theme
        background: {
          DEFAULT: "hsl(220, 13%, 13%)", // Dark gray background
          card: "hsl(220, 13%, 18%)",
          hover: "hsl(220, 13%, 23%)",
        },
        foreground: {
          DEFAULT: "hsl(0, 0%, 95%)", // Light text
          muted: "hsl(0, 0%, 70%)",
        },
        primary: {
          DEFAULT: "hsl(210, 100%, 50%)", // Blue accent (AutoCAD-style)
          hover: "hsl(210, 100%, 45%)",
        },
        accent: {
          green: "hsl(120, 60%, 50%)",
          yellow: "hsl(45, 100%, 55%)",
          red: "hsl(0, 75%, 55%)",
        },
        border: "hsl(220, 13%, 25%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}
