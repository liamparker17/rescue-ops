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
        accent: "#D97706",
        "accent-light": "#FFFBEB",
        danger: "#E11D48",
        success: "#059669",
      },
    },
  },
  plugins: [],
};
export default config;
