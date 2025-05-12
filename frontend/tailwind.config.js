// tailwind.config.js


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(toast|spinner).js",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
      },
    },
  },
  darkMode: "class",
  plugins: [],
};