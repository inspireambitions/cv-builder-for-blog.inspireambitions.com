"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useRootControlLocale } from "@/lib/root-control-locale";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const { locale, t } = useRootControlLocale();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("ia-theme");
    const initial = saved === "light" || saved === "dark"
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(initial);
    queueMicrotask(() => setTheme(initial));
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ia-theme", next);
    applyTheme(next);
  };
  const label = t(theme === "dark" ? "sharedUi.themeLight" : "sharedUi.themeDark");

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      lang={locale}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
