import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./content/**/*.mdx", "./public/**/*.svg"],
  theme: {},
  future: {
    hoverOnlyWhenSupported: true,
  },
  daisyui: {
    themes: ["light", "dark", "bumblebee"],
  },
  plugins: [require("daisyui")],
} satisfies Config;
