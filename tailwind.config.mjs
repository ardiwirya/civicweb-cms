import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warna instansi tidak di-hardcode di sini. Nilai aslinya diisi
        // lewat CSS variable (lihat src/styles/global.css) yang di-inject
        // dari institution_profile.primary_color / secondary_color.
        // Kelas Tailwind yang dipakai di komponen: bg-brand-primary, text-brand-secondary, dst.
        brand: {
          primary: "rgb(var(--color-brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-brand-secondary) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};
