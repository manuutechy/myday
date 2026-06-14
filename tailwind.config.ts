import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#FF6B00", // Orange
          hover: "#E05E00",
        },
        customBg: "#FAFAFA",
        customSurface: "#FFFFFF",
        textPrimary: "#111111",
        textSecondary: "#6B7280",
        customBorder: "#E5E7EB",
        customSuccess: "#1D9E75",
        deepWork: "#534AB7",
        nightBlock: "#3C3489",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        element: "8px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
