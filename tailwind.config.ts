import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./src/**/*.{ts,tsx}", "./content/**/*.mdx", "./public/**/*.svg"],
  theme: {
    extend: {
      keyframes: {
        "notification-slide-in": {
          "0%": {
            transform: "translateY(-150%) translateX(-50%)",
            opacity: "0",
          },
          "30%": {
            transform: "translateY(-20%) translateX(-50%)",
            opacity: "0.5",
          },
          "100%": {
            transform: "translateY(0) translateX(-50%)",
            opacity: "1",
          },
        },
        "notification-appear": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
            filter: "blur(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
            filter: "blur(0px)",
          },
        },
        "notification-fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) translateX(-50%) scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(20%) translateX(-50%) scale(0.95)",
          },
        },
        "notification-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.9",
          },
        },
      },
      animation: {
        "notification-slide-in":
          "notification-slide-in 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "notification-appear":
          "notification-appear 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "notification-fade-out":
          "notification-fade-out 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "notification-pulse":
          "notification-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "green",
        },
      },
    ],
  },
  plugins: [
    require("daisyui"),
    plugin(({ addUtilities }: { addUtilities: any }) => {
      addUtilities({
        ".mask-image-gradient": {
          "mask-image":
            "linear-gradient(to bottom, black 60%, transparent 90%)",
          "-webkit-mask-image":
            "linear-gradient(to bottom, black 60%, transparent 90%)",
          height: "400px",
        },
      });
    }),
  ],
} satisfies Config;
