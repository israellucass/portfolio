import type { Metadata } from "next";
import { Caveat, Inter, Merriweather } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

/** Project titles, mastheads, section labels */
const fontDisplay = Merriweather({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
});

/** Handwritten HMW post-it callouts — casual but readable */
const fontHandwriting = Caveat({
  variable: "--font-handwriting",
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
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontHandwriting.variable} h-full`}
    >
      <body className="site-wrap min-h-full font-body antialiased">
        <a href="#main" className="skip-link focus-ring">
          Skip to content
        </a>
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
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
