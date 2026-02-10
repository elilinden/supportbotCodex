import type { Metadata } from "next";
import { Space_Grotesk, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage"
});

export const metadata: Metadata = {
  title: "Pro-Se Prime",
  description: "Information-only guidance for New York Family Court Orders of Protection."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={[
          spaceGrotesk.variable,
          bricolage.variable,
          "min-h-screen antialiased",
          "bg-ui-bg text-ui-text"
        ].join(" ")}
      >
        {/* Subtle background wash */}
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute top-10 right-[-10%] h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
        </div>

        <div className="min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ui-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>

          {/* Sticky "app header" */}
          <header className="sticky top-0 z-50 border-b border-ui-border bg-ui-surface/75 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <TopNav />
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <SafetyBanner />
            </div>
          </header>

          {/* Main content */}
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
