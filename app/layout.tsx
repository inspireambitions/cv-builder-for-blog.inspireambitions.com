import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "InspireAmbitions CV Builder — Free CV Builder by an HR Specialist",
  description:
    "Build a professional, HR-approved CV in minutes. Free JPEG export, no watermark. Built by a practising HR Specialist with GCC/MENA expertise.",
  keywords: [
    "CV builder",
    "resume builder",
    "free CV",
    "HR approved",
    "Gulf CV",
    "UAE CV",
    "MENA jobs",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PY9B70N583"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PY9B70N583');
          `}
        </Script>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
