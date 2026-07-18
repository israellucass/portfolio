import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { createRootMetadata } from "@/lib/metadata";
import "./globals.css";

/** Body, nav, tags, UI */
const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/** Logo + project titles / display headings (Adonis → Space Grotesk) */
const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} ${fontDisplay.variable} h-full`}
    >
      <body className="site-wrap min-h-full font-body antialiased">
        <a href="#main" className="skip-link focus-ring">
          Skip to content
        </a>
        <Header />
        <main
          id="main"
          tabIndex={-1}
          className="site-container mx-auto w-full max-w-[1440px]"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
