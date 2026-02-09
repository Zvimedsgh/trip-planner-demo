import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, t as translate, TranslationKey } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved === "en" || saved === "he") return saved;
    }
    return "en";
  });

  const updateLanguageMutation = trpc.auth.updateLanguage.useMutation();

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    // Don't update language on server for public pages (shared trips)
    if (!window.location.pathname.startsWith('/shared/')) {
      updateLanguageMutation.mutate({ language: lang });
    }
  }, [updateLanguageMutation]);

  const t = useCallback((key: TranslationKey) => translate(key, language), [language]);

  const isRTL = language === "he";

  useEffect(() => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
