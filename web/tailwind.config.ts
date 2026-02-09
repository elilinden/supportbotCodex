// web/tailwind.config.ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  // ✅ dark:* only applies when you add class="dark" manually
  darkMode: ["class"],

  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],

  theme: {
    extend: {
      colors: {
        /**
         * Legacy tokens (keep so existing UI doesn't break)
         * ✅ Updated to match new dashboard palette (high impact)
         */
        ink: "#0f172a", // was #0b0f19
        glass: "rgba(255, 255, 255, 0.08)",
        glassStrong: "rgba(255, 255, 255, 0.16)",
        borderGlass: "rgba(255, 255, 255, 0.16)",
        accentMint: "#6ee7b7",
        accentBlue: "#2563eb", // was #60a5fa
        accentRose: "#fb7185",

        /**
         * New dashboard tokens (light-first)
         */
        ui: {
          bg: "#f7f8fb",
          surface: "#ffffff",
          surface2: "#f2f4f8",
          text: "#0f172a",
          textMuted: "#64748b",
          border: "#e5e7eb",
          borderStrong: "#d1d5db",

          primary: "#2563eb",
          primarySoft: "#dbeafe",

          success: "#16a34a",
          successSoft: "#dcfce7",

          warning: "#d97706",
          warningSoft: "#ffedd5",

          danger: "#dc2626",
          dangerSoft: "#fee2e2"
        }
      },

      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.06)",
        cardSm: "0 6px 18px rgba(15, 23, 42, 0.06)",
        ring: "0 0 0 4px rgba(37, 99, 235, 0.18)",
        glass: "0 20px 50px rgba(0, 0, 0, 0.35)"
      },

      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px"
      },

      fontFamily: {
        display: ['"Space Grotesk"', '"Bricolage Grotesque"', '"Segoe UI"', "sans-serif"],
        body: ['"Space Grotesk"', '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"]
      },

      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "float-in": "floatIn 0.45s ease-out forwards"
      }
    }
  },

  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        "html, body": {
          backgroundColor: "#f7f8fb",
          color: "#0f172a"
        },
        a: {
          color: "#2563eb"
        },
        "input, textarea, select": {
          color: "#0f172a"
        }
      });
    })
  ]
};

export default config;