import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InspireAmbitions CV Builder — Free CV Builder by an HR Director",
  description:
    "Build a professional, HR-approved CV in minutes. Free JPEG export, no watermark. Built by a practising HR Director with GCC/MENA expertise.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
