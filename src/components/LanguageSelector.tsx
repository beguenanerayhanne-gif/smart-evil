'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import { Language } from '@/lib/i18n/translations'

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'EN' },
  ]

  return (
    <div className="lang-selector" aria-label="Sélecteur de langue">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`lang-btn ${language === lang.code ? 'active' : ''}`}
          type="button"
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
