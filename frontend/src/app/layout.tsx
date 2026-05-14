import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import ClientProviders from "@/components/ClientProviders";
import ConditionalShell from "@/components/ConditionalShell";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prompt Dairy — Learn Prompt Engineering & AI Systems",
  description:
    "Master prompt engineering, AI system design, and LLM workflows. Practice prompt writing, explore AI architectures, and experiment in our interactive playground.",
  keywords: [
    "prompt engineering",
    "AI",
    "LLM",
    "machine learning",
    "prompt design",
    "RAG",
    "AI agents",
  ],
  authors: [{ name: "Prompt Dairy Team" }],
  openGraph: {
    title: "Prompt Dairy — Learn Prompt Engineering & AI Systems",
    description:
      "Master prompt engineering, AI system design, and LLM workflows.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Prompt Dairy — AI Learning Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Dairy — Learn Prompt Engineering & AI Systems",
    description: "Master prompt engineering, AI system design, and LLM workflows.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
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
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 45,
            opacity: 0.08,
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,229,255,0.08) 0px, rgba(0,229,255,0.08) 1px, transparent 2px, transparent 4px)",
          }}
        />

        {/* Background orbs */}
        <div
          className="orb"
          style={{
            width: "500px",
            height: "500px",
            background: "#7c3aed",
            top: "-100px",
            left: "-100px",
          }}
          aria-hidden="true"
        />
        <div
          className="orb"
          style={{
            width: "400px",
            height: "400px",
            background: "#3b82f6",
            top: "40%",
            right: "-100px",
            animationDelay: "2s",
          }}
          aria-hidden="true"
        />
        <div
          className="orb"
          style={{
            width: "350px",
            height: "350px",
            background: "#06b6d4",
            bottom: "10%",
            left: "20%",
            animationDelay: "4s",
          }}
          aria-hidden="true"
        />

        <AuthProvider>
          <ClientProviders>
            <ConditionalShell>{children}</ConditionalShell>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
