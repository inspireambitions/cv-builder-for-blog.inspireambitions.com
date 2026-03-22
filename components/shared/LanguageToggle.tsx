"use client";

import { useLocale } from "@/lib/locale";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="bg-gray-100 rounded-lg p-0.5 flex text-sm">
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded transition-colors ${
          locale === "en"
            ? "bg-gold-500 text-white font-medium"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("ar")}
        className={`px-2 py-0.5 rounded transition-colors ${
          locale === "ar"
            ? "bg-gold-500 text-white font-medium"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        عربي
      </button>
    </div>
  );
}
