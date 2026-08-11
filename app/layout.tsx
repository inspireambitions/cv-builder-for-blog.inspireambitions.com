import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import DeferredAnalytics from "@/components/shared/DeferredAnalytics";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: "600",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cv.inspireambitions.com"),
  alternates: { canonical: "/" },
  title: "InspireAmbitions CV Builder - Free CV Builder by an HR Career Specialist",
  description:
    "Build a clear CV in minutes. Get free ATS-safe PDF and Word files with no watermark. Built by an HR Career Specialist with GCC and Africa experience.",
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
    <html lang="en" dir="ltr" suppressHydrationWarning className={cormorant.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ia-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50"><DeferredAnalytics />{children}</body>
    </html>
  );
}
