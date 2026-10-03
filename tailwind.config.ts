import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12132B",
        surface: "#1B1D3A",
        paper: "#FAFAF8",
        line: "#E4E3EE",
        amber: {
          DEFAULT: "#F2A93B",
          dim: "#F7D9A3",
        },
        teal: {
          DEFAULT: "#12857D",
          dim: "#CFE8E5",
        },
        rose: "#D14D4D",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
