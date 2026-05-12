import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MobileBottomNav, TopNav } from "@/components/nav";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "CEFANET Digital Notice Board",
  description:
    "Civic-technology platform for monitoring Zambia's Constituency Development Fund (CDF).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen pb-16 md:pb-0">
        <Providers>
          <TopNav />
          <main className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
