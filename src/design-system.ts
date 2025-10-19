/**
 * Design System / Design Language
 * Generated using Figma file W7XtfZ4Edo7i1hT5u3Avep and aligned with current Tailwind + CSS variables.
 * All color values use HSL for consistency with Tailwind theme.
 */

export type Hsl = string; // e.g. "160 84% 39%" or "0 0% 0% / 0.1"

export const designSystem = {
  meta: {
    source: "figma:W7XtfZ4Edo7i1hT5u3Avep",
    generated: new Date().toISOString(),
  },
  colors: {
    // Matches :root variables in src/index.css (light mode)
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "160 84% 39%",
      primaryForeground: "0 0% 100%",
      secondary: "24 95% 53%",
      secondaryForeground: "0 0% 100%",
      muted: "220 14% 96%",
      mutedForeground: "220 9% 46%",
      accent: "160 84% 39%",
      accentForeground: "0 0% 100%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 100%",
      border: "220 13% 91%",
      input: "220 13% 91%",
      ring: "160 84% 39%",
    },
    // Matches .dark variables in src/index.css (dark mode)
    dark: {
      background: "222.2 47% 11%",
      foreground: "210 40% 98%",
      card: "222.2 47% 15%",
      cardForeground: "210 40% 98%",
      popover: "222.2 47% 15%",
      popoverForeground: "210 40% 98%",
      primary: "160 84% 49%",
      primaryForeground: "222.2 47% 11%",
      secondary: "24 95% 63%",
      secondaryForeground: "222.2 47% 11%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20% 65%",
      accent: "160 84% 49%",
      accentForeground: "222.2 47% 11%",
      destructive: "0 62.8% 50%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 20%",
      input: "217.2 32.6% 20%",
      ring: "160 84% 49%",
    },
    // Additional tokens derived from Figma frames
    figma: {
      canvasBackground: "0 0% 100%", // #FFFFFF
      headerBackground: "0 0% 0%", // #000000
      outlineSoft: "0 0% 0% / 0.10", // rgba(0,0,0,0.1)
    },
  },
  gradients: {
    primary: "linear-gradient(135deg, hsl(160 84% 39%), hsl(160 84% 49%))",
    secondary: "linear-gradient(135deg, hsl(24 95% 53%), hsl(24 95% 63%))",
    hero: "linear-gradient(180deg, hsl(0 0% 100%), hsl(160 84% 97%))",
  },
  shadows: {
    soft: "0 2px 8px hsl(220 13% 20% / 0.08)",
    medium: "0 4px 16px hsl(220 13% 20% / 0.12)",
    elevated: "0 8px 24px hsl(220 13% 20% / 0.16)",
  },
  radii: {
    base: "0.75rem",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
  layout: {
    container: {
      maxWidth2xl: "1400px", // tailwind container screens.2xl
      padding: "2rem",
    },
    header: {
      width: "1920px",
      height: "122px", // Figma Header frame
      background: "0 0% 0%",
    },
    frames: {
      linkSvg: { width: "162px", height: "49.19px" },
      googlePlayButton: { width: "170px", height: "50.36px" },
    },
    stroke: {
      outlineSoft: { color: "0 0% 0% / 0.10", weight: "1px" },
    },
  },
  // Extended tokens
  semantic: {
    light: {
      info: "201 90% 40%",
      success: "142 72% 38%",
      warning: "38 92% 50%",
      danger: "0 84% 60%",
      neutral: "220 9% 46%",
    },
    dark: {
      info: "201 90% 60%",
      success: "142 72% 52%",
      warning: "38 92% 60%",
      danger: "0 62.8% 50%",
      neutral: "215 20% 65%",
    },
  },
  typography: {
    fontFamily: {
      sans: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
    },
    headings: {
      h1: { fontSize: "2.5rem", lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" },
      h2: { fontSize: "2rem", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.01em" },
      h3: { fontSize: "1.5rem", lineHeight: "1.2", fontWeight: "600", letterSpacing: "0" },
      h4: { fontSize: "1.25rem", lineHeight: "1.3", fontWeight: "600", letterSpacing: "0" },
      h5: { fontSize: "1.125rem", lineHeight: "1.4", fontWeight: "600", letterSpacing: "0" },
    },
    body: {
      lg: { fontSize: "1.125rem", lineHeight: "1.7", fontWeight: "400", letterSpacing: "0" },
      md: { fontSize: "1rem", lineHeight: "1.6", fontWeight: "400", letterSpacing: "0" },
      sm: { fontSize: "0.875rem", lineHeight: "1.6", fontWeight: "400", letterSpacing: "0" },
    },
    label: {
      sm: { fontSize: "0.75rem", lineHeight: "1.3", fontWeight: "500", letterSpacing: "0.02em" },
    },
  },
  spacing: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem",
    24: "6rem",
  },
  motion: {
    durations: { fast: "150ms", normal: "250ms", slow: "400ms" },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    },
  },
  zIndex: {
    navbar: 50,
    sidebar: 40,
    modal: 100,
    toast: 200,
  },
  surfaces: {
    level1: "0 2px 8px hsl(220 13% 20% / 0.08)",
    level2: "0 4px 16px hsl(220 13% 20% / 0.12)",
    level3: "0 8px 24px hsl(220 13% 20% / 0.16)",
  },
};

/**
 * Utilities to map tokens to CSS variables at runtime
 * Note: Tailwind already reads from CSS variables defined in src/index.css.
 * Use these only if you need programmatic theme switching beyond the existing dark mode.
 */
export type ThemeMode = "light" | "dark";

export function applyTheme(mode: ThemeMode = "light") {
  const root = document.documentElement;
  const palette = designSystem.colors[mode];
  const toVar = (name: string) => `--${name}`;

  // Core palette
  root.style.setProperty(toVar("background"), palette.background);
  root.style.setProperty(toVar("foreground"), palette.foreground);
  root.style.setProperty(toVar("card"), palette.card);
  root.style.setProperty(toVar("card-foreground"), palette.cardForeground);
  root.style.setProperty(toVar("popover"), palette.popover);
  root.style.setProperty(toVar("popover-foreground"), palette.popoverForeground);
  root.style.setProperty(toVar("primary"), palette.primary);
  root.style.setProperty(toVar("primary-foreground"), palette.primaryForeground);
  root.style.setProperty(toVar("secondary"), palette.secondary);
  root.style.setProperty(toVar("secondary-foreground"), palette.secondaryForeground);
  root.style.setProperty(toVar("muted"), palette.muted);
  root.style.setProperty(toVar("muted-foreground"), palette.mutedForeground);
  root.style.setProperty(toVar("accent"), palette.accent);
  root.style.setProperty(toVar("accent-foreground"), palette.accentForeground);
  root.style.setProperty(toVar("destructive"), palette.destructive);
  root.style.setProperty(toVar("destructive-foreground"), palette.destructiveForeground);
  root.style.setProperty(toVar("border"), palette.border);
  root.style.setProperty(toVar("input"), palette.input);
  root.style.setProperty(toVar("ring"), palette.ring);

  // Shadows / radii (non-critical for Tailwind but useful for JS-driven styles)
  root.style.setProperty("--shadow-soft", designSystem.shadows.soft);
  root.style.setProperty("--shadow-medium", designSystem.shadows.medium);
  root.style.setProperty("--shadow-elevated", designSystem.shadows.elevated);
  root.style.setProperty("--radius", designSystem.radii.base);
}

/**
 * Convenience getters for consuming tokens in TS/JS code
 */
export const tokens = {
  color: (key: keyof typeof designSystem.colors.light, mode: ThemeMode = "light"): Hsl =>
    designSystem.colors[mode][key],
  gradient: (key: keyof typeof designSystem.gradients) => designSystem.gradients[key],
  shadow: (key: keyof typeof designSystem.shadows) => designSystem.shadows[key],
  radius: (key: keyof typeof designSystem.radii) => designSystem.radii[key],
  layout: {
    header: () => designSystem.layout.header,
    container: () => designSystem.layout.container,
    frames: () => designSystem.layout.frames,
    stroke: () => designSystem.layout.stroke,
  },
};