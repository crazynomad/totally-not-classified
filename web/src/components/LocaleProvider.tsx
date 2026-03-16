"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { detectLocale, getTranslations, LocaleContext, type Locale } from "@/lib/i18n";

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  const t = getTranslations(locale);

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      <button
        onClick={toggle}
        className="lang-toggle"
        title={locale === "en" ? "切换到中文" : "Switch to English"}
      >
        {locale === "en" ? "中" : "EN"}
      </button>
      {children}
    </LocaleContext.Provider>
  );
}
