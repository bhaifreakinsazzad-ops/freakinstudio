"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  ArrowRight,
  Box,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Palette,
  Shield,
  Sliders,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { DISCIPLINES } from "../data/catalog-bridge";
import { AnimatedNumber, getSpringEase, runKinetic } from "../utils/motion";
import { StudioMonogram } from "./StudioMonogram";
import type { LangCode } from "../types";

type ToolId =
  | "resizer"
  | "compressor"
  | "palette"
  | "contrast"
  | "briefTpl"
  | "mockup3d";

export function FreeCreativePlayground({
  lang,
  reducedMotion,
  onBridgeToBrief,
  onBridgeToAi,
}: {
  lang: LangCode;
  reducedMotion: boolean;
  onBridgeToBrief: (topic: string) => void;
  onBridgeToAi: () => void;
}) {
  const [activeTool, setActiveTool] = useState<ToolId>("resizer");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState(
    "freakins-sample-artboard.png"
  );
  const [sourceDimensions, setSourceDimensions] = useState({
    w: 1200,
    h: 1200,
  });
  const [statusMessage, setStatusMessage] = useState("");

  const [targetWidth, setTargetWidth] = useState(1080);
  const [targetHeight, setTargetHeight] = useState(1350);
  const [exportFormat, setExportFormat] = useState<
    "image/png" | "image/jpeg" | "image/webp"
  >("image/png");

  const [quality, setQuality] = useState(0.78);
  const [compressedInfo, setCompressedInfo] = useState({
    originalKb: 0,
    compressedKb: 0,
    dataUrl: "",
  });

  const [extractedPalette, setExtractedPalette] = useState<string[]>([
    "#090A0A",
    "#D9BD81",
    "#F6F4EF",
    "#232528",
    "#8F7643",
    "#3D4045",
  ]);
  const [copiedHex, setCopiedHex] = useState("");

  const [fgColor, setFgColor] = useState("#D9BD81");
  const [bgColor, setBgColor] = useState("#090A0A");

  const [tplBrand, setTplBrand] = useState("");
  const [tplDiscipline, setTplDiscipline] = useState(
    "Social Media & Campaign Creative"
  );
  const [tplGoal, setTplGoal] = useState("");
  const [tplAudience, setTplAudience] = useState("");
  const [tplDeadline] = useState("Standard Milestone Schedule");

  const [rotY, setRotY] = useState(28);
  const [rotX, setRotX] = useState(-14);

  const workbenchRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !workbenchRef.current) return;
    const root = workbenchRef.current;
    runKinetic(root.querySelectorAll(".tool-panel-enter"), {
      opacity: [0, 1],
      y: [10, 0],
      duration: 380,
      ease: "outCubic",
    });
    runKinetic(root.querySelectorAll(".local-canvas-scanline"), {
      top: ["0%", "100%"],
      opacity: [0.85, 0],
      duration: 750,
      ease: "inOutQuad",
    });
  }, [activeTool, sourceImageUrl, reducedMotion]);

  const generateBuiltInSample = useCallback(() => {
    const off = document.createElement("canvas");
    off.width = 1200;
    off.height = 1200;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#090A0A";
    ctx.fillRect(0, 0, 1200, 1200);

    ctx.strokeStyle = "#232528";
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1080, 1080);

    ctx.strokeStyle = "#D9BD81";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(600, 600, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(217, 189, 129, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 600, 270, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#D9BD81";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FREAKIN'S STUDIO • LOCAL SPECIMEN", 600, 490);

    ctx.fillStyle = "#F6F4EF";
    ctx.font = "bold 76px sans-serif";
    ctx.fillText("DESIGN. CREATE.", 600, 595);
    ctx.fillText("PRODUCE. GROW.", 600, 685);

    ctx.fillStyle = "#A8A295";
    ctx.font = "28px sans-serif";
    ctx.fillText("1200 × 1200 PX • 100% BROWSER CANVAS", 600, 770);

    const url = off.toDataURL("image/png");
    setSourceImageUrl(url);
    setSourceDimensions({ w: 1200, h: 1200 });
    setSourceFileName("freakins-local-specimen.png");
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      generateBuiltInSample();
    });
    return () => window.cancelAnimationFrame(id);
  }, [generateBuiltInSample]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage(
        "Unsupported file type. Please choose a valid PNG, JPEG, or WebP image."
      );
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      setStatusMessage("Unable to read selected file locally.");
    };
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl !== "string") return;
      const img = new Image();
      img.onerror = () => {
        setStatusMessage(
          `Could not decode "${file.name}" as a valid image. Keeping previous artboard.`
        );
      };
      img.onload = () => {
        setSourceImageUrl(dataUrl);
        setSourceDimensions({ w: img.width, h: img.height });
        setSourceFileName(file.name);
        setStatusMessage(
          `Loaded "${file.name}" (${img.width}×${img.height}px) locally in browser memory.`
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!sourceImageUrl) return;
    const img = new Image();
    img.onload = () => {
      const pCanvas = document.createElement("canvas");
      const pCtx = pCanvas.getContext("2d");
      pCanvas.width = 64;
      pCanvas.height = 64;
      if (pCtx) {
        pCtx.drawImage(img, 0, 0, 64, 64);
        const data = pCtx.getImageData(0, 0, 64, 64).data;
        const buckets = new Map<string, number>();
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 24) * 24;
          const g = Math.round(data[i + 1] / 24) * 24;
          const b = Math.round(data[i + 2] / 24) * 24;
          const hex =
            "#" +
            [Math.min(255, r), Math.min(255, g), Math.min(255, b)]
              .map((v) => v.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase();
          buckets.set(hex, (buckets.get(hex) || 0) + 1);
        }
        const sorted = Array.from(buckets.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([hex]) => hex);
        if (sorted.length > 0) setExtractedPalette(sorted);
      }

      const cCanvas = document.createElement("canvas");
      cCanvas.width = img.width;
      cCanvas.height = img.height;
      const cCtx = cCanvas.getContext("2d");
      if (cCtx) {
        cCtx.drawImage(img, 0, 0);
        const originalData = cCanvas.toDataURL("image/png");
        const compressedData = cCanvas.toDataURL("image/jpeg", quality);
        const origKb = Math.max(
          1,
          Math.round((originalData.length * 3) / 4 / 1024)
        );
        const compKb = Math.max(
          1,
          Math.round((compressedData.length * 3) / 4 / 1024)
        );
        setCompressedInfo({
          originalKb: origKb,
          compressedKb: compKb,
          dataUrl: compressedData,
        });
      }
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl, quality]);

  const handleExportResized = () => {
    if (!sourceImageUrl) return;
    const img = new Image();
    img.onload = () => {
      const out = document.createElement("canvas");
      out.width = Math.min(4096, Math.max(32, Number(targetWidth) || 1080));
      out.height = Math.min(4096, Math.max(32, Number(targetHeight) || 1080));
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#090A0A";
      ctx.fillRect(0, 0, out.width, out.height);

      const scale = Math.max(out.width / img.width, out.height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (out.width - drawW) / 2;
      const dy = (out.height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);

      const ext =
        exportFormat === "image/webp"
          ? "webp"
          : exportFormat === "image/jpeg"
            ? "jpg"
            : "png";
      const dataUrl = out.toDataURL(exportFormat, 0.92);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `freakins-${out.width}x${out.height}.${ext}`;
      a.click();
      setStatusMessage(
        `Exported ${out.width}×${out.height}px (${ext.toUpperCase()}) locally.`
      );
    };
    img.src = sourceImageUrl;
  };

  const handleExportCompressed = () => {
    if (!compressedInfo.dataUrl) return;
    const a = document.createElement("a");
    a.href = compressedInfo.dataUrl;
    a.download = `freakins-compressed-q${Math.round(quality * 100)}.jpg`;
    a.click();
    setStatusMessage(
      `Exported compressed JPEG (${compressedInfo.compressedKb} KB) locally.`
    );
  };

  const contrastMetrics = useMemo(() => {
    const parseHex = (hex: string): [number, number, number] => {
      const clean = hex.replace("#", "");
      if (!/^[0-9a-f]{6}$/i.test(clean)) return [0, 0, 0];
      return [
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255,
      ];
    };
    const luminance = ([r, g, b]: [number, number, number]) => {
      const channel = (c: number) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const l1 = luminance(parseHex(fgColor));
    const l2 = luminance(parseHex(bgColor));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return {
      ratio: Number(ratio.toFixed(2)),
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaaNormal: ratio >= 7.0,
    };
  }, [fgColor, bgColor]);

  const generatedTemplateMarkdown = useMemo(() => {
    return [
      `# Creative Production Brief — Freakin's Studio`,
      `- **Brand / Project:** ${tplBrand || "[Your Brand Name]"}`,
      `- **Discipline:** ${tplDiscipline}`,
      `- **Primary Objective:** ${tplGoal || "[Define campaign or brand goal]"}`,
      `- **Target Audience:** ${tplAudience || "[Define customer segment]"}`,
      `- **Delivery Window:** ${tplDeadline}`,
      `- **Extracted Brand Palette:** ${extractedPalette.join(", ")}`,
      `- **Revision Policy:** 2 Consolidated Revision Rounds Included`,
      ``,
      `## Required Assets & Notes`,
      `- Provide vector logo (SVG/EPS) or high-res PNG if existing.`,
      `- Express 10-min delivery applies only to eligible single-file micro-edits upon slot acceptance.`,
    ].join("\n");
  }, [
    tplBrand,
    tplDiscipline,
    tplGoal,
    tplAudience,
    tplDeadline,
    extractedPalette,
  ]);

  const handleDownloadBriefTemplate = () => {
    const blob = new Blob([generatedTemplateMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freakins-creative-brief-template.md";
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Downloaded structured Creative Brief Markdown locally.");
  };

  const toolsList: { id: ToolId; label: string; icon: typeof Sliders }[] = [
    { id: "resizer", label: "Image Resizer & Export", icon: Sliders },
    { id: "compressor", label: "Image Compressor", icon: Zap },
    { id: "palette", label: "Palette Extractor", icon: Palette },
    { id: "contrast", label: "WCAG Contrast Checker", icon: Eye },
    { id: "briefTpl", label: "Brief Template Builder", icon: FileText },
    { id: "mockup3d", label: "3D Packaging Preview", icon: Box },
  ];

  return (
    <section
      ref={workbenchRef}
      aria-labelledby="playground-heading"
      className="space-y-6"
    >
      <div className="rounded-2xl bg-[#090A0A] border border-[#232528] p-6 sm:p-8 text-[#F6F4EF]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#232528] text-[#D9BD81] border border-[#D9BD81]/30">
            <Shield className="w-3.5 h-3.5" />
            REAL LOCAL FUNCTIONALITY • ZERO LOGIN • ZERO SERVER UPLOAD
          </span>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm hover:brightness-105 transition min-h-[44px]">
            <Upload className="w-4 h-4" />
            <span>Upload Local Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>
        <h2
          id="playground-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          {lang === "bn"
            ? "ব্রাউজার-নেটিভ ফ্রি ক্রিয়েটিভ টুলস"
            : "Browser-Native Free Creative Playground"}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#F6F4EF]/80 max-w-3xl">
          {lang === "bn"
            ? "আপনার ছবি বা ফাইল কখনোই সার্ভারে আপলোড হয় না। সরাসরি আপনার ব্রাউজারে রিসাইজ, কম্প্রেস, কালার প্যালেট এবং ব্রিফ তৈরি করুন।"
            : "Every utility below runs 100% locally in your browser using HTML5 Canvas and deterministic math. Your images never leave your device."}
        </p>

        <div
          role="tablist"
          aria-label="Free Creative Utilities"
          className="mt-6 flex flex-wrap gap-2"
        >
          {toolsList.map((t) => {
            const Icon = t.icon;
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTool(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#D9BD81] ${
                  active
                    ? "bg-[#D9BD81] text-[#090A0A] shadow-md"
                    : "bg-[#232528] text-[#F6F4EF] hover:bg-[#232528]/80 border border-[#F6F4EF]/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 px-4 py-2.5 rounded-xl bg-[#232528] border border-[#D9BD81]/40 text-xs sm:text-sm text-[#D9BD81] flex items-center justify-between"
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              className="text-[#F6F4EF]/70 hover:text-[#F6F4EF] p-1"
              aria-label="Dismiss status"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tool Workbench Card */}
      <div className="tool-panel-enter rounded-2xl bg-[#F6F4EF] border border-[#232528]/20 p-6 sm:p-8 text-[#090A0A] shadow-sm">
        {activeTool === "resizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div>
                <h3 className="text-xl font-bold">
                  Image Resizer &amp; Platform Exporter
                </h3>
                <p className="text-sm text-[#232528] mt-1">
                  Source:{" "}
                  <span className="font-mono text-xs bg-[#090A0A]/10 px-2 py-0.5 rounded">
                    {sourceFileName}
                  </span>{" "}
                  ({sourceDimensions.w}×{sourceDimensions.h}px)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#232528] mb-2">
                  Quick Social &amp; Web Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "IG Square (1080×1080)", w: 1080, h: 1080 },
                    { name: "IG Portrait (1080×1350)", w: 1080, h: 1350 },
                    { name: "Story / Reel (1080×1920)", w: 1080, h: 1920 },
                    { name: "FB Cover (1640×624)", w: 1640, h: 624 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setTargetWidth(preset.w);
                        setTargetHeight(preset.h);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition min-h-[44px] ${
                        targetWidth === preset.w && targetHeight === preset.h
                          ? "bg-[#090A0A] text-[#D9BD81] border-[#090A0A]"
                          : "bg-white text-[#090A0A] border-[#232528]/20 hover:border-[#090A0A]"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="resize-w"
                    className="block text-xs font-bold text-[#232528] mb-1"
                  >
                    Width (px)
                  </label>
                  <input
                    id="resize-w"
                    type="number"
                    min="32"
                    max="4096"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="resize-h"
                    className="block text-xs font-bold text-[#232528] mb-1"
                  >
                    Height (px)
                  </label>
                  <input
                    id="resize-h"
                    type="number"
                    min="32"
                    max="4096"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="export-fmt"
                  className="block text-xs font-bold text-[#232528] mb-1"
                >
                  Output Format
                </label>
                <select
                  id="export-fmt"
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(
                      e.target.value as
                        | "image/png"
                        | "image/jpeg"
                        | "image/webp"
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#232528]/30 text-base"
                >
                  <option value="image/png">PNG (Lossless Transparency)</option>
                  <option value="image/jpeg">JPEG (Universal Web)</option>
                  <option value="image/webp">WebP (Modern Lightweight)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportResized}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download Resized Asset ({targetWidth}×{targetHeight}px)
                </span>
              </button>
            </div>

            <div className="lg:col-span-7 relative bg-[#090A0A] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px] border border-[#232528] overflow-hidden">
              {!reducedMotion && (
                <div
                  aria-hidden="true"
                  className="local-canvas-scanline pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D9BD81] to-transparent"
                />
              )}
              <div className="text-xs font-mono text-[#D9BD81] mb-3">
                LIVE LOCAL PREVIEW • ASPECT{" "}
                {(targetWidth / Math.max(1, targetHeight)).toFixed(2)}:1
              </div>
              {sourceImageUrl && (
                <div
                  style={{
                    aspectRatio: `${Math.max(1, targetWidth)} / ${Math.max(1, targetHeight)}`,
                    maxHeight: "280px",
                    maxWidth: "100%",
                    transition: reducedMotion ? "none" : "aspect-ratio 240ms ease",
                  }}
                  className="overflow-hidden rounded-lg border-2 border-[#D9BD81]/60 shadow-lg bg-[#232528] flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceImageUrl}
                    alt="Local resize preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTool === "compressor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl font-bold">
                Client-Side Image Compressor
              </h3>
              <p className="text-sm text-[#232528]">
                Adjust JPEG compression quality in real time and compare local
                byte savings before exporting.
              </p>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <label htmlFor="quality-range">Compression Quality</label>
                  <span className="font-mono text-[#090A0A]">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  id="quality-range"
                  type="range"
                  min="0.15"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[#090A0A] h-3 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-[#232528]/15">
                <div>
                  <div className="text-xs text-[#232528]">Original Est.</div>
                  <div className="text-lg font-bold font-mono">
                    <AnimatedNumber
                      value={compressedInfo.originalKb}
                      suffix=" KB"
                      reducedMotion={reducedMotion}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#232528]">Compressed</div>
                  <div className="text-lg font-bold font-mono text-emerald-700">
                    <AnimatedNumber
                      value={compressedInfo.compressedKb}
                      suffix=" KB"
                      reducedMotion={reducedMotion}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#232528]">Reduction</div>
                  <div className="text-lg font-bold font-mono">
                    <AnimatedNumber
                      value={Math.max(
                        0,
                        Math.round(
                          ((compressedInfo.originalKb -
                            compressedInfo.compressedKb) /
                            Math.max(1, compressedInfo.originalKb)) *
                            100
                        )
                      )}
                      suffix="%"
                      reducedMotion={reducedMotion}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCompressed}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090A0A] text-[#D9BD81] font-bold text-sm hover:bg-[#232528] transition min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>
                  Export Compressed Image ({compressedInfo.compressedKb} KB)
                </span>
              </button>
            </div>

            <div className="lg:col-span-6 bg-[#090A0A] rounded-2xl p-6 flex flex-col items-center justify-center">
              {compressedInfo.dataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={compressedInfo.dataUrl}
                  alt="Compressed output preview"
                  className="max-h-[260px] rounded-xl border border-[#D9BD81]/40 object-contain"
                />
              )}
            </div>
          </div>
        )}

        {activeTool === "palette" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">
                  Deterministic Color Palette Extractor
                </h3>
                <p className="text-sm text-[#232528]">
                  Sampled directly from pixels in{" "}
                  <span className="font-mono text-xs">{sourceFileName}</span>.
                  Click any swatch to copy HEX.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onBridgeToBrief(
                    `Palette Swatches: ${extractedPalette.join(", ")}`
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#090A0A] text-[#D9BD81] text-sm font-bold min-h-[44px]"
              >
                <span>Attach Palette to Smart Brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {extractedPalette.map((hex, i) => (
                <button
                  key={hex}
                  type="button"
                  onClick={(e) => {
                    navigator.clipboard?.writeText(hex);
                    setCopiedHex(hex);
                    setFgColor(hex);
                    if (!reducedMotion) {
                      runKinetic(e.currentTarget, {
                        scale: [0.95, 1.04, 1],
                        duration: 380,
                        ease: getSpringEase(),
                      });
                    }
                    setTimeout(() => setCopiedHex(""), 1800);
                  }}
                  className="group rounded-2xl overflow-hidden border border-[#232528]/20 bg-white text-left shadow-sm hover:border-[#090A0A] transition focus:outline-none focus:ring-2 focus:ring-[#D9BD81]"
                >
                  <div
                    style={{ backgroundColor: hex }}
                    className="h-24 w-full flex items-end p-2"
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold">{hex}</span>
                    {copiedHex === hex ? (
                      <Check className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#232528]/60 group-hover:text-[#090A0A]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTool === "contrast" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl font-bold">
                WCAG 2.2 Brand Contrast Checker
              </h3>
              <p className="text-sm text-[#232528]">
                Verify legibility for English &amp; Bangla typography before
                sending brand assets to print or social feeds.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#232528]/20">
                  <label
                    htmlFor="fg-picker"
                    className="block text-xs font-bold uppercase text-[#232528] mb-2"
                  >
                    Text / Foreground
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="fg-picker"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                      className="w-12 h-11 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full font-mono text-sm px-2.5 py-2 border border-[#232528]/20 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#232528]/20">
                  <label
                    htmlFor="bg-picker"
                    className="block text-xs font-bold uppercase text-[#232528] mb-2"
                  >
                    Surface / Background
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="bg-picker"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                      className="w-12 h-11 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full font-mono text-sm px-2.5 py-2 border border-[#232528]/20 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFgColor("#D9BD81");
                    setBgColor("#090A0A");
                  }}
                  className="px-3 py-2 rounded-lg bg-[#090A0A] text-[#D9BD81] text-xs font-bold min-h-[44px]"
                >
                  Load Freakin&apos;s Gold / Obsidian
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFgColor("#090A0A");
                    setBgColor("#F6F4EF");
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-[#090A0A] text-[#090A0A] text-xs font-bold min-h-[44px]"
                >
                  Load Obsidian / Ivory
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div
                style={{ backgroundColor: bgColor, color: fgColor }}
                className="p-6 rounded-2xl border border-[#232528]/30 shadow-inner space-y-2 transition-colors duration-200"
              >
                <div className="text-xs font-mono uppercase tracking-widest opacity-80">
                  CONTRAST RATIO:{" "}
                  <AnimatedNumber
                    value={contrastMetrics.ratio}
                    decimals={2}
                    suffix=" : 1"
                    reducedMotion={reducedMotion}
                  />
                </div>
                <div className="text-2xl font-bold">
                  DESIGN. CREATE. PRODUCE. GROW.
                </div>
                <p className="text-base">
                  আপনার ব্যবসার জন্য মানসম্মত ডিজাইন ও ক্রিয়েটিভ সলিউশন —
                  Readable bilingual specimen text.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div
                  className={`p-3 rounded-xl border font-bold text-xs ${
                    contrastMetrics.aaLarge
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                      : "bg-rose-50 border-rose-600 text-rose-900"
                  }`}
                >
                  AA Large (3.0:1): {contrastMetrics.aaLarge ? "PASS" : "FAIL"}
                </div>
                <div
                  className={`p-3 rounded-xl border font-bold text-xs ${
                    contrastMetrics.aaNormal
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                      : "bg-rose-50 border-rose-600 text-rose-900"
                  }`}
                >
                  AA Body (4.5:1): {contrastMetrics.aaNormal ? "PASS" : "FAIL"}
                </div>
                <div
                  className={`p-3 rounded-xl border font-bold text-xs ${
                    contrastMetrics.aaaNormal
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                      : "bg-amber-50 border-amber-600 text-amber-900"
                  }`}
                >
                  AAA Body (7.0:1):{" "}
                  {contrastMetrics.aaaNormal ? "PASS" : "FAIL"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTool === "briefTpl" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold">
                Offline Creative Brief Template Generator
              </h3>
              <p className="text-sm text-[#232528]">
                Build a clean, structured creative brief locally—no AI quota or
                account required.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">
                  Brand or Store Name
                </label>
                <input
                  type="text"
                  value={tplBrand}
                  onChange={(e) => setTplBrand(e.target.value)}
                  placeholder="e.g., Kazi Roast & Co."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">
                  Creative Discipline
                </label>
                <select
                  value={tplDiscipline}
                  onChange={(e) => setTplDiscipline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">
                  Primary Deliverable &amp; Goal
                </label>
                <input
                  type="text"
                  value={tplGoal}
                  onChange={(e) => setTplGoal(e.target.value)}
                  placeholder="e.g., 3 social campaign posts for seasonal launch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#232528] mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={tplAudience}
                  onChange={(e) => setTplAudience(e.target.value)}
                  placeholder="e.g., Urban young professionals in Dhaka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#232528]/25 text-base"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between bg-[#090A0A] text-[#F6F4EF] p-5 rounded-2xl border border-[#232528]">
              <div>
                <div className="text-xs font-mono text-[#D9BD81] mb-2">
                  STRUCTURED MARKDOWN OUTPUT
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-[#232528]/60 p-4 rounded-xl border border-[#F6F4EF]/10 overflow-x-auto">
                  {generatedTemplateMarkdown}
                </pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBriefTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] font-bold text-sm min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .MD Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onBridgeToBrief(
                      tplGoal || tplBrand || "Structured Creative Brief"
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232528] text-[#F6F4EF] border border-[#D9BD81]/40 font-semibold text-sm min-h-[44px]"
                >
                  <span>Send to Studio Brief Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === "mockup3d" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#090A0A] text-[#D9BD81] text-xs font-bold">
                <Box className="w-3.5 h-3.5" />
                <span>
                  {reducedMotion
                    ? "STATIC 2D FALLBACK (REDUCED MOTION)"
                    : "INTERACTIVE 3D SPECIMEN STAGE"}
                </span>
              </div>
              <h3 className="text-xl font-bold">
                Brand Packaging &amp; Card Specimen
              </h3>
              <p className="text-sm text-[#232528]">
                Applies your extracted palette (
                <span className="font-mono">{extractedPalette[0]}</span> &amp;{" "}
                <span className="font-mono">
                  {extractedPalette[1] || "#D9BD81"}
                </span>
                ) onto a physical box specimen.
              </p>

              {!reducedMotion && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex justify-between text-xs font-bold mb-1">
                      <span>Horizontal Angle</span>
                      <span className="font-mono">{rotY}°</span>
                    </label>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={rotY}
                      onChange={(e) => setRotY(Number(e.target.value))}
                      className="w-full accent-[#090A0A]"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold mb-1">
                      <span>Vertical Tilt</span>
                      <span className="font-mono">{rotX}°</span>
                    </label>
                    <input
                      type="range"
                      min="-35"
                      max="35"
                      value={rotX}
                      onChange={(e) => setRotX(Number(e.target.value))}
                      className="w-full accent-[#090A0A]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#090A0A] rounded-2xl p-8 flex items-center justify-center min-h-[300px] overflow-hidden">
              <div
                style={{
                  transform: reducedMotion
                    ? "none"
                    : `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                  transition: reducedMotion
                    ? "none"
                    : "transform 150ms ease-out",
                  backgroundColor: extractedPalette[0] || "#090A0A",
                  borderColor: extractedPalette[1] || "#D9BD81",
                }}
                className="w-60 h-72 rounded-2xl border-2 p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <StudioMonogram size={32} reducedMotion={reducedMotion} />
                  <span
                    style={{ color: extractedPalette[1] || "#D9BD81" }}
                    className="text-[10px] font-mono tracking-widest uppercase"
                  >
                    EDITION 01
                  </span>
                </div>
                <div>
                  <div
                    style={{ color: extractedPalette[1] || "#D9BD81" }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    {tplBrand || "FREAKIN'S STUDIO"}
                  </div>
                  <div className="text-lg font-bold text-[#F6F4EF] mt-1 leading-snug">
                    Crafted Packaging Specimen
                  </div>
                </div>
                <div className="pt-3 border-t border-white/15 flex justify-between text-[10px] font-mono text-[#F6F4EF]/70">
                  <span>CMYK + GOLD FOIL</span>
                  <span>SRV-10</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#232528]/15 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-[#232528]">
            <span className="font-bold text-[#090A0A]">
              Keep editing free forever
            </span>{" "}
            — or bridge your work to Studio AI copy or a human designer.
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBridgeToAi}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#090A0A] text-[#090A0A] text-sm font-bold hover:bg-[#090A0A] hover:text-[#D9BD81] transition min-h-[44px]"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate Ad Hooks (No Puter Login)</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onBridgeToBrief(
                  `Asset prepared in Free Playground (${sourceFileName})`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9BD81] text-[#090A0A] text-sm font-bold hover:brightness-105 transition min-h-[44px]"
            >
              <span>Finish with a Human Expert</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
