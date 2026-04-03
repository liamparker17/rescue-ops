import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/shared/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0D9488",         // Muted teal
        "accent-light": "#CCFBF1", // Teal-50
        danger: "#E11D48",
        success: "#059669",
      },
    },
  },
  plugins: [],
};
export default config;
