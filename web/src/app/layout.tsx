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
  title: "NY Family Court OP Navigator",
  description: "Information-only guidance for New York Family Court Orders of Protection."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          spaceGrotesk.variable,
          bricolage.variable,
          "min-h-screen antialiased",
          "bg-slate-50 text-slate-900"
        ].join(" ")}
      >
        <div className="min-h-screen">
          {/* Sticky header */}
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <TopNav />
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <SafetyBanner />
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
