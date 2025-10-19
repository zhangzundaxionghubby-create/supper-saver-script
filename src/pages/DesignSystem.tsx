import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tokens, applyTheme, designSystem, ThemeMode } from "@/design-system";

const colorKeys: Array<keyof typeof designSystem.colors.light> = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "muted",
  "mutedForeground",
  "destructive",
  "destructiveForeground",
  "border",
  "input",
  "ring",
];

const gradientKeys = ["primary", "secondary", "hero"] as const;
const shadowKeys = ["soft", "medium", "elevated"] as const;
const radiusKeys = ["base", "md", "sm"] as const;

const Swatch = ({ label, value, isColor }: { label: string; value: string; isColor?: boolean }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
    <div
      className="h-10 w-10 rounded-md border"
      style={isColor ? { backgroundColor: `hsl(${value})` } : { backgroundImage: value }}
    />
    <div className="text-sm">
      <div className="font-medium">{label}</div>
      <div className="text-muted-foreground">{value}</div>
    </div>
  </div>
);

const BoxPreview = ({ label, shadow, radius }: { label: string; shadow?: string; radius?: string }) => (
  <div className="p-3 rounded-lg border bg-card">
    <div
      className="h-20 w-full bg-muted flex items-center justify-center text-sm"
      style={{ boxShadow: shadow, borderRadius: radius }}
    >
      {label}
    </div>
  </div>
);

const typeSamples = [
  { label: "H1", style: designSystem.typography.headings.h1, sample: "Headlines build hierarchy" },
  { label: "H2", style: designSystem.typography.headings.h2, sample: "Section titles guide scanning" },
  { label: "H3", style: designSystem.typography.headings.h3, sample: "Subtitles add context" },
  { label: "Body lg", style: designSystem.typography.body.lg, sample: "Readable paragraphs, generous leading" },
  { label: "Body md", style: designSystem.typography.body.md, sample: "Default copy for UI" },
  { label: "Body sm", style: designSystem.typography.body.sm, sample: "Supporting text" },
];

const TypeRow = ({ label, style, sample }: { label: string; style: any; sample: string }) => (
  <div className="p-3 rounded-lg border bg-card">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div
      style={{
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        fontFamily: designSystem.typography.fontFamily.sans,
      }}
    >
      {sample}
    </div>
  </div>
);

const spacingScale = Object.entries(designSystem.spacing);

const DesignSystemPage: React.FC = () => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    applyTheme(mode);
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [mode]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Design System Preview</h1>
            <p className="text-muted-foreground">Source: {designSystem.meta.source}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={mode === "light" ? "default" : "outline"} onClick={() => setMode("light")}>Light</Button>
            <Button variant={mode === "dark" ? "default" : "outline"} onClick={() => setMode("dark")}>Dark</Button>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {colorKeys.map((key) => (
                <Swatch key={key} label={key} value={tokens.color(key, mode)} isColor />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Gradients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gradientKeys.map((key) => (
                <Swatch key={key} label={key} value={tokens.gradient(key)} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Shadows & Radii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shadowKeys.map((key) => (
                <BoxPreview key={key} label={`shadow: ${key}`} shadow={tokens.shadow(key)} />
              ))}
              {radiusKeys.map((key) => (
                <BoxPreview key={key} label={`radius: ${key}`} radius={tokens.radius(key)} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Layout Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 rounded-lg border">
                <div className="text-sm font-medium mb-2">Container</div>
                <div className="text-sm text-muted-foreground">padding: {designSystem.layout.container.padding}</div>
                <div className="text-sm text-muted-foreground">2xl max: {designSystem.layout.container.maxWidth2xl}</div>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="text-sm font-medium mb-2">Header Frame</div>
                <div className="text-sm text-muted-foreground">{designSystem.layout.header.width} × {designSystem.layout.header.height}</div>
                <div className="text-sm text-muted-foreground">bg: {designSystem.layout.header.background}</div>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="text-sm font-medium mb-2">Stroke (Outline Soft)</div>
                <div className="text-sm text-muted-foreground">{designSystem.layout.stroke.outlineSoft.color} @ {designSystem.layout.stroke.outlineSoft.weight}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Semantic Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(designSystem.semantic[mode]).map(([key, value]) => (
                <Swatch key={key} label={key} value={String(value)} isColor />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {typeSamples.map((t) => (
                <TypeRow key={t.label} label={t.label} style={t.style} sample={t.sample} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Spacing Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spacingScale.map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg border bg-card">
                  <div className="text-sm font-medium mb-2">{k}</div>
                  <div className="text-muted-foreground">{v}</div>
                  <div className="mt-2 h-2 bg-primary" style={{ width: v }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemPage;