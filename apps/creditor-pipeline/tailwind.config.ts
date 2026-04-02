import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#4F46E5",
        "accent-light": "#EEF2FF",
        danger: "#E11D48",
        success: "#059669",
      },
    },
  },
  plugins: [],
};
export default config;
