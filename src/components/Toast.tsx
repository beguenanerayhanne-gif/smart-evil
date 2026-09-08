'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckIcon } from '@/components/Icons'

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null)
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && toast.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--gray-900)',
            color: 'var(--white)',
            padding: '0.85rem 1.35rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--mint)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckIcon size={14} />
          </div>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return { showToast: (msg: string) => { console.log(msg) } }
  }
  return context
}
