'use client'

import { useState } from 'react'
import { TruckIcon, ShieldCheckIcon, StarIcon, PhoneIcon } from '@/components/Icons'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export default function TrustSection() {
  const { t } = useTranslation()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const features = [
    {
      icon: TruckIcon,
      title: t('trust.fast_delivery'),
      description: t('trust.fast_delivery_sub'),
      color: '#e11d48',
      bg: '#fff1f2',
      border: '#fecdd3',
    },
    {
      icon: ShieldCheckIcon,
      title: t('trust.cash_payment'),
      description: t('trust.cash_payment_sub'),
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
    },
    {
      icon: StarIcon,
      title: t('trust.guaranteed_quality'),
      description: t('trust.guaranteed_quality_sub'),
      color: '#d97706',
      bg: '#fefce8',
      border: '#fef08a',
    },
    {
      icon: PhoneIcon,
      title: t('trust.customer_service'),
      description: t('trust.customer_service_sub'),
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
  ]

  return (
    <section style={{ margin: '2.5rem 0 3.5rem 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {features.map((item, idx) => {
          const Icon = item.icon
          const isHovered = hoveredIdx === idx
          return (
            <div
              key={idx}
              className="shimmer-container"
              style={{
                backgroundColor: item.bg,
                border: `1.5px solid ${isHovered ? item.color : item.border}`,
                borderRadius: '20px',
                padding: '1.25rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: isHovered ? `0 12px 28px -4px ${item.color}25` : '0 4px 14px rgba(0, 0, 0, 0.03)',
                transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="shimmer-overlay" />

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isHovered ? `0 6px 16px ${item.color}35` : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isHovered ? 'scale(1.12) rotate(-8deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <Icon size={24} />
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--gray-900)',
                    marginBottom: '0.15rem',
                    lineHeight: '1.3',
                  }}
                >
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.785rem', color: 'var(--gray-600)', lineHeight: '1.35', fontWeight: 500 }}>
                  {item.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

