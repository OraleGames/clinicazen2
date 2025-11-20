'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { t, setLanguage, getCurrentLanguageCode, LanguageCode } from '@/lib/i18n'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
  currentLanguage: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>('es')

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguageState(lang)
    setLanguage(lang)
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleLanguageChange,
    t,
    currentLanguage: language === 'es' ? 'Español' : 'English'
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}