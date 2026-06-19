"use client";

import * as React from "react";
import { en, type Dictionary } from "./en";
import { ar } from "./ar";

export type Locale = "en" | "ar";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "cglab-locale";

/**
 * I18nProvider — wraps the app and provides the current locale + dictionary.
 *
 * - Persists the user's choice in localStorage.
 * - Sets `document.documentElement.dir` to "rtl" when Arabic is selected.
 * - Sets `document.documentElement.lang` to the current locale.
 * - Defaults to "en" on first visit.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  // On mount, read the saved locale from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "ar" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      // localStorage might not be available (SSR, privacy mode)
    }
  }, []);

  // Update <html> dir + lang whenever locale changes
  React.useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  const setLocale = React.useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = React.useCallback(
    () => setLocaleState((prev) => (prev === "en" ? "ar" : "en")),
    [],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      t: DICTIONARIES[locale],
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * useI18n — hook to access the current locale, dictionary, and direction.
 *
 * Usage:
 *   const { t, locale, dir, toggleLocale } = useI18n();
 *   <h1>{t.hero.headline1}</h1>
 */
export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
