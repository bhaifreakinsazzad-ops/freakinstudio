"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { Download, Share, PlusSquare, Check, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true
      );
    };

    if (checkStandalone()) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const macTouch =
      ua.includes("mac") &&
      typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 1;
    setIsIOS(ios || macTouch);

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setShowGuide(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return (
      <span
        className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono text-emerald-300"
        title="Creative Office OS Installed"
      >
        <Check className="h-3 w-3" />
        OS Installed
      </span>
    );
  }

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
    } else {
      setShowGuide((prev) => !prev);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9BD81]/35 bg-[#D9BD81]/10 px-2.5 py-1.5 text-[11px] font-mono text-[#D9BD81] hover:bg-[#D9BD81]/20 transition-colors min-h-[44px]"
        title="Install Freakin's Studio Creative Office OS"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Install OS</span>
      </button>

      {showGuide && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-[#232528] bg-[#090A0A] p-4 shadow-2xl text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#232528]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#D9BD81]">
              Install Creative Office OS
            </span>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-[#F6F4EF]/60 hover:text-[#F6F4EF]"
              aria-label="Close install guide"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {isIOS ? (
            <div className="mt-2.5 space-y-2 text-[#F6F4EF]/80 text-[11px]">
              <p className="flex items-center gap-2">
                <Share className="h-3.5 w-3.5 text-[#D9BD81] shrink-0" />
                <span>1. Tap the browser Share button.</span>
              </p>
              <p className="flex items-center gap-2">
                <PlusSquare className="h-3.5 w-3.5 text-[#D9BD81] shrink-0" />
                <span>2. Select &ldquo;Add to Home Screen&rdquo;.</span>
              </p>
            </div>
          ) : (
            <p className="mt-2.5 text-[11px] text-[#F6F4EF]/75 leading-relaxed">
              Open this app in a standalone tab or click the install icon in
              your browser&apos;s address bar to install{" "}
              <strong className="text-[#D9BD81]">FreakinsOS</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
