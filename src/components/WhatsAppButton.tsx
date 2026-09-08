'use client'

import { WhatsAppIcon } from '@/components/Icons'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export default function WhatsAppButton({ phone = '0556901248' }: { phone?: string }) {
  const { t, dir } = useTranslation()
  const targetPhone = phone || '0556901248'
  const cleanPhone = targetPhone.replace(/\D/g, '')
  const formattedPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone
  const whatsappUrl = `https://wa.me/${formattedPhone}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        left: dir === 'rtl' ? '1.75rem' : 'auto',
        right: dir === 'rtl' ? 'auto' : '1.75rem',
        zIndex: 99,
        backgroundColor: '#25D366',
        color: 'white',
        borderRadius: 'var(--radius-full)',
        padding: '0.75rem 1.35rem',
        boxShadow: '0 8px 24px -2px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
        fontWeight: 800,
        fontSize: '0.9rem',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(37, 211, 102, 0.65)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(37, 211, 102, 0.55)'
      }}
      title={t('whatsapp.contact_us')}
    >
      {/* Radar pulse rings */}
      <span className="radar-ring" style={{ color: '#25D366' }} />
      <span className="radar-ring radar-ring-delayed" style={{ color: '#25D366' }} />

      <div className="animate-wobble" style={{ display: 'flex', alignItems: 'center' }}>
        <WhatsAppIcon size={22} />
      </div>
      <span>{t('whatsapp.floating_button')}</span>
    </a>
  )
}

