import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/i18n/context";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freakinstudio.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Freakin's Studio — Creative Commerce Operating System",
    template: "%s",
  },
  description:
    "Bespoke graphic design, brand identity, video & 3D motion production, social content, paid ad creative, and corporate communication across 60 canonical services.",
  openGraph: {
    type: "website",
    siteName: "Freakin's Studio",
    title: "Freakin's Studio — Creative Commerce Operating System",
    description:
      "60 precision creative services across 7 disciplines with server-authoritative BDT & USD pricing, interactive proofing, and commercial buyout delivery.",
    images: [
      {
        url: "/images/portfolio/brand-identity.jpg",
        width: 1200,
        height: 900,
        alt: "Freakin's Studio — Creative Commerce Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freakin's Studio — Creative Commerce Operating System",
    description:
      "60 precision creative services across 7 disciplines with transparent pricing, interactive proofing, and commercial buyout delivery.",
    images: ["/images/portfolio/brand-identity.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col cyber-scrollbar">
        <LocaleProvider>
          {children}
        </LocaleProvider>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
