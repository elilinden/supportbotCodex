import type { Metadata } from "next";
import { Space_Grotesk, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://proseprime.com"),
  title: { default: "Pro-Se Prime", template: "%s | Pro-Se Prime" },
  description: "Information-only guidance for New York Family Court Orders of Protection.",
  openGraph: {
    siteName: "Pro-Se Prime",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary" },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Pro-Se Prime",
            url: "https://proseprime.com",
            description: "Information-only guidance for New York Family Court Orders of Protection.",
          }) }}
        />
      </head>
      <body
        className={[
          spaceGrotesk.variable,
          bricolage.variable,
          "min-h-screen antialiased",
          "bg-ui-bg text-ui-text"
        ].join(" ")}
      >
        <AuthProvider>
        <div className="min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ui-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>

          {/* Sticky "app header" */}
          <header className="sticky top-0 z-50 border-b border-ui-border bg-ui-surface/75 backdrop-blur">
            <TopNav />
            <SafetyBanner />
          </header>

          {/* Main content */}
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          <Footer />
        </div>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
