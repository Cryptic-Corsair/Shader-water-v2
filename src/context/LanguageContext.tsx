import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type SiteLang = 'bn' | 'en';

export const SITE_LANG_STORAGE_KEY = 'site-lang';

interface LanguageContextValue {
  lang: SiteLang;
  isBangla: boolean;
  setLang: (next: SiteLang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'bn',
  isBangla: true,
  setLang: () => {},
  toggleLang: () => {},
});

function readInitialLang(): SiteLang {
  if (typeof window === 'undefined') return 'bn';
  try {
    const stored = window.localStorage.getItem(SITE_LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'bn') {
      return stored;
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
  return 'bn';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>(readInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SITE_LANG_STORAGE_KEY, lang);
      } catch {
        // Ignore storage errors
      }
    }
  }, [lang]);

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isBangla: lang === 'bn',
        setLang,
        toggleLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
