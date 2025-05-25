"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Shuffle, Copy, Palette, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/toast";
import { Loader } from "@/components/ui/loader";

interface GradientStop {
  color: string;
  position: number;
}

interface GradientConfig {
  type: "linear" | "radial" | "conic";
  direction: number;
  stops: GradientStop[];
}

const predefinedGradients = [
  {
    name: "Sunset",
    config: {
      type: "linear" as const,
      direction: 45,
      stops: [
        { color: "#ff6b6b", position: 0 },
        { color: "#feca57", position: 50 },
        { color: "#ff9ff3", position: 100 },
      ],
    },
  },
  {
    name: "Ocean",
    config: {
      type: "linear" as const,
      direction: 135,
      stops: [
        { color: "#667eea", position: 0 },
        { color: "#764ba2", position: 100 },
      ],
    },
  },
  {
    name: "Forest",
    config: {
      type: "radial" as const,
      direction: 0,
      stops: [
        { color: "#56ab2f", position: 0 },
        { color: "#a8e6cf", position: 100 },
      ],
    },
  },
];

export default function Home() {
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(
    predefinedGradients[0].config
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportResolution, setExportResolution] = useState("4K");
  const gradientRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Utility: Convert oklch() color to hex (approximate, browser-based)
  function oklchToHex(oklch: string): string {
    // Only process if string starts with oklch
    if (!oklch.startsWith("oklch")) return oklch;
    try {
      // Use browser to parse and convert to hex
      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        ctx.fillStyle = oklch;
        // ctx.fillStyle will be in rgb(), so convert to hex
        const rgb = ctx.fillStyle.match(/rgb\\((\\d+), (\\d+), (\\d+)\\)/);
        if (rgb) {
          const r = parseInt(rgb[1]).toString(16).padStart(2, "0");
          const g = parseInt(rgb[2]).toString(16).padStart(2, "0");
          const b = parseInt(rgb[3]).toString(16).padStart(2, "0");
          return `#${r}${g}${b}`;
        }
        // If already hex
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(ctx.fillStyle)) return ctx.fillStyle;
      }
    } catch {}
    // Fallback to black if conversion fails
    return "#000000";
  }

  // Utility: Ensure all gradient stops use hex color codes
  function ensureHexStops(stops: GradientStop[]): GradientStop[] {
    return stops.map((stop) => {
      // If already hex, return as is
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(stop.color)) return stop;
      // Convert oklch to hex if needed
      let color = stop.color;
      if (color.startsWith("oklch")) {
        color = oklchToHex(color);
      } else {
        // Try to convert hsl/rgb to hex using browser
        try {
          const ctx = document.createElement("canvas").getContext("2d");
          if (ctx) {
            ctx.fillStyle = color;
            color = ctx.fillStyle;
          }
        } catch {}
      }
      // If still not hex, fallback to black
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) color = "#000000";
      return { ...stop, color };
    });
  }

  const generateGradientCSS = useCallback(
    (config: GradientConfig) => {
      const { type, direction, stops } = config;
      const safeStops = ensureHexStops(stops);
      const stopStrings = safeStops
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(", ");

      switch (type) {
        case "linear":
          return `linear-gradient(${direction}deg, ${stopStrings})`;
        case "radial":
          return `radial-gradient(circle, ${stopStrings})`;
        case "conic":
          return `conic-gradient(from ${direction}deg, ${stopStrings})`;
        default:
          return `linear-gradient(${direction}deg, ${stopStrings})`;
      }
    },
    [ensureHexStops]
  );

  const generateRandomGradient = useCallback(() => {
    const types: Array<"linear" | "radial" | "conic"> = [
      "linear",
      "radial",
      "conic",
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomDirection = Math.floor(Math.random() * 360);

    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#ff3838",
      "#2ed573",
      "#3742fa",
      "#f368e0",
      "#ffa726",
      "#26de81",
      "#a55eea",
    ];

    const numStops = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    const stops: GradientStop[] = [];

    for (let i = 0; i < numStops; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const position =
        i === 0
          ? 0
          : i === numStops - 1
          ? 100
          : Math.floor(Math.random() * 80) + 10;
      stops.push({ color: randomColor, position });
    }

    // Sort stops by position
    stops.sort((a, b) => a.position - b.position);

    setGradientConfig({
      type: randomType,
      direction: randomDirection,
      stops,
    });
  }, []);

  const generateAIGradient = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-gradient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (response.ok) {
        const gradientData = await response.json();
        setGradientConfig(gradientData);
        showToast("AI gradient generated!", "success");
      } else {
        // Fallback to random gradient if API fails
        generateRandomGradient();
        showToast(
          "AI failed to generate a gradient, showing random instead.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error generating AI gradient:", error);
      // Fallback to random gradient on error
      generateRandomGradient();
      showToast(
        "AI failed to generate a gradient, showing random instead.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCSS = () => {
    const css = `background: ${generateGradientCSS(gradientConfig)};`;
    navigator.clipboard.writeText(css);
    showToast("CSS copied!", "success");
  };

  const exportImage = async (format: "png" | "jpeg") => {
    if (!gradientRef.current) return;

    // Use sanitized gradient CSS (no oklch)
    const safeBackground = generateGradientCSS(gradientConfig);
    const originalBg = gradientRef.current.style.background;
    gradientRef.current.style.background = safeBackground;

    const resolution =
      exportResolution === "4K"
        ? { width: 3840, height: 2160 }
        : { width: 7680, height: 4320 };

    try {
      const canvas = await html2canvas(gradientRef.current, {
        width: resolution.width,
        height: resolution.height,
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `gradient-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      link.click();
      showToast("Image downloaded!", "success");
    } catch (error) {
      console.error("Error exporting image:", error);
      showToast(
        "Failed to export image. Try again or check browser permissions.",
        "error"
      );
    } finally {
      // Restore original background
      gradientRef.current.style.background = originalBg;
    }
  };

  const updateStopColor = (index: number, color: string) => {
    const newStops = [...gradientConfig.stops];
    newStops[index].color = color;
    setGradientConfig({ ...gradientConfig, stops: newStops });
  };

  const updateStopPosition = (index: number, position: number) => {
    const newStops = [...gradientConfig.stops];
    newStops[index].position = position;
    setGradientConfig({ ...gradientConfig, stops: newStops });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-x-hidden">
      {/* Decorative background grid */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-neutral-700/[0.04] dark:bg-grid-neutral-300/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent dark:from-slate-900/60" />
      </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 flex flex-col items-center gap-4">
          <div className="inline-block rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 mb-2 animate-pulse shadow-lg">
            <span className="block bg-white dark:bg-slate-900 px-6 py-2 rounded-full text-lg font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
              TooliQ
            </span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-lg">
            AI Gradient Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly create, customize, and export stunning gradients for your
            web projects. Powered by AI, designed for designers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-8">
            {/* AI Generation */}
            <Card className="shadow-md border-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  AI Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Describe your gradient (e.g., 'sunset over mountains')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-white/80 dark:bg-slate-800/80"
                />
                <Button
                  onClick={generateAIGradient}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2" /> Generating...
                    </>
                  ) : (
                    "Generate with AI"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow border-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="h-5 w-5 text-purple-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateRandomGradient}
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  Random Gradient
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedGradients.map((gradient, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setGradientConfig(gradient.config)}
                      className="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {gradient.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gradient Controls */}
            <Card className="shadow border-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-pink-500" />
                  Customize
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={gradientConfig.type}
                    onValueChange={(value: "linear" | "radial" | "conic") =>
                      setGradientConfig({ ...gradientConfig, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="conic">Conic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {gradientConfig.type === "linear" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Direction: {gradientConfig.direction}°
                    </label>
                    <Slider
                      value={[gradientConfig.direction]}
                      onValueChange={([value]) =>
                        setGradientConfig({ ...gradientConfig, direction: value })
                      }
                      max={360}
                      step={1}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Color Stops
                  </label>
                  <div className="space-y-3">
                    {gradientConfig.stops.map((stop, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateStopColor(index, e.target.value)}
                          className="w-10 h-10 rounded border shadow"
                        />
                        <div className="flex-1">
                          <Slider
                            value={[stop.position]}
                            onValueChange={([value]) =>
                              updateStopPosition(index, value)
                            }
                            max={100}
                            step={1}
                          />
                        </div>
                        <span className="text-sm w-12">{stop.position}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="shadow border-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-500" />
                  Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Resolution
                  </label>
                  <Select
                    value={exportResolution}
                    onValueChange={setExportResolution}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4K">4K (3840×2160)</SelectItem>
                      <SelectItem value="8K">8K (7680×4320)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => exportImage("png")}
                    variant="outline"
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30"
                    disabled={isGenerating}
                  >
                    PNG
                  </Button>
                  <Button
                    onClick={() => exportImage("jpeg")}
                    variant="outline"
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30"
                    disabled={isGenerating}
                  >
                    JPEG
                  </Button>
                </div>

                <Button
                  onClick={copyCSS}
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 flex flex-col justify-center items-center">
            <Card className="h-full shadow-xl border-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={gradientRef}
                  className="w-full h-96 lg:h-[600px] rounded-2xl shadow-2xl border-2 border-blue-100 dark:border-blue-900 transition-all duration-300"
                  style={{
                    background: generateGradientCSS(gradientConfig),
                  }}
                />
                <div className="mt-4 p-3 bg-muted rounded-md border text-center">
                  <code className="text-base break-all font-mono">
                    background: {generateGradientCSS(gradientConfig)};
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
