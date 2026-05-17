import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CdfmsChrome } from "@/components/cdfms/chrome";
import { DemoWatermark } from "@/components/cdfms/demo-watermark";

export const metadata: Metadata = {
  title: "CEFANET CDF-MS · Republic of Zambia",
  description:
    "CEFANET Constituency Development Fund Management System — partnered with the Ministry of Local Government and Rural Development",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet — required for the Zambia province heatmap */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-ink-50">
        <Providers>
          <CdfmsChrome>{children}</CdfmsChrome>
          <DemoWatermark />
        </Providers>
      </body>
    </html>
  );
}
