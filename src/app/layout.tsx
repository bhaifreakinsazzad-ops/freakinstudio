import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#090A0A",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://freakinstudio.space"
  ),
  title: {
    default:
      "Freakin's Studio — Creative Office OS 2.0 | DESIGN. CREATE. PRODUCE. GROW.",
    template: "%s | Freakin's Studio",
  },
  description:
    "DESIGN. CREATE. PRODUCE. GROW. 6 zero-login local browser creative tools, 5 Puter-free sponsored Studio AI assistants, 3 AI micro-kits (৳49/৳99/৳199), and 13 hourly-scoped human creative services across 4 disciplines.",
  keywords: [
    "Freakin's Studio",
    "Creative Office OS",
    "Design Studio Bangladesh",
    "Brand Identity",
    "Packaging Design",
    "Motion Graphics",
    "Social Media Creative",
    "AI Micro-Kits",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FreakinsOS",
  },
  icons: {
    icon: [
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Freakin's Studio — Creative Office OS 2.0",
    description:
      "Free browser-native creative tools, sponsored Studio AI direction, and 13 hourly-scoped human creative services across 4 disciplines.",
    url: "https://freakinstudio.space",
    siteName: "Freakin's Studio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freakin's Studio — Creative Office OS 2.0",
    description:
      "DESIGN. CREATE. PRODUCE. GROW. Free creative utilities, Studio AI assistants, and 13 human creative services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090A0A] text-[#F6F4EF] selection:bg-[#D9BD81] selection:text-[#090A0A] cyber-scrollbar">
        <I18nProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </I18nProvider>
      </body>
    </html>
  );
}
