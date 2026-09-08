'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface LanguageContextType {
  language: Language
  dir: 'ltr' | 'rtl'
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  dir: 'ltr',
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')

  useEffect(() => {
    // Detect saved language preference
    const saved = localStorage.getItem('smart_lang') as Language
    if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
      setLanguageState(saved)
      setDir(saved === 'ar' ? 'rtl' : 'ltr')
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    const newDir = lang === 'ar' ? 'rtl' : 'ltr'
    setDir(newDir)

    // Update DOM attributes
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', newDir)
      document.documentElement.setAttribute('lang', lang)
    }

    // Save in storage and cookie
    localStorage.setItem('smart_lang', lang)
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`
  }

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.fr
    let text = (dict as Record<string, string>)[key] || (translations.fr as Record<string, string>)[key] || key

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return text
  }

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
