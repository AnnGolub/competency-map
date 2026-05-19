import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        avenir: ["'Avenir Next'", "Avenir", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        app: {
          canvas: "#16181F",
          sidebar: "#21222C",
          "sidebar-border": "#252732",
          "nav-tab": "#2A2D3A",
          surface: "#1E1E28",
          border: "#2A2A36",
          muted: "#8B8FA3",
          accent: "#3B82F6",
          "accent-hover": "#2563EB",
        },
      },
      fontSize: {
        "page-title": ["32px", { lineHeight: "40px", fontWeight: "600" }],
      },
      borderWidth: {
        hairline: "0.5px",
      },
    },
  },
  plugins: [],
};
export default config;
