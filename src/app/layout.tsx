import type { Metadata } from "next";
import { Inter, Space_Grotesk, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reelzak — AI-Generated Reels, Crafted by Humans",
  description:
    "Reelzak is a productized AI media agency. We ideate, generate, and edit high-quality AI reels for brands — delivered through a seamless client portal.",
  keywords: [
    "Reelzak",
    "AI Reels",
    "AI Media Agency",
    "Productized Service",
    "AI Video",
    "Reels Production",
    "AI Generation",
  ],
  authors: [{ name: "Reelzak Studio" }],
  openGraph: {
    title: "Reelzak — AI-Generated Reels, Crafted by Humans",
    description:
      "Submit a brief. Our team handles ideation, AI generation, and editing. Receive your finished reel.",
    siteName: "Reelzak",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reelzak — AI-Generated Reels, Crafted by Humans",
    description:
      "Submit a brief. Our team handles ideation, AI generation, and editing. Receive your finished reel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${geistMono.variable} font-sans antialiased reelzak-bg reelzak-grain reelzak-grid min-h-screen`}
      >
        <ThemeProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
          <Toaster />
          <SonnerToaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.10 0 0)",
                border: "1px solid oklch(1 0 0 / 12%)",
                color: "oklch(0.97 0 0)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
