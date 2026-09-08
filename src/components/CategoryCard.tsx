'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TagIcon, ArrowRightIcon } from '@/components/Icons'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'

import CategoryIcon from '@/components/CategoryIcon'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    icon?: string | null
    children?: { id: string; name: string; slug: string; icon?: string | null }[]
    _count?: { products: number }
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { t, language } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const productCount = category._count?.products ?? 0
  const translatedName = getTranslatedCategoryName(category, language)

  return (
    <Link
      href={`/categorie/${category.slug}`}
      className="shimmer-container"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        borderRadius: '20px',
        border: isHovered ? '1.5px solid var(--primary)' : '1.5px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: '#ffffff',
        textDecoration: 'none',
        boxShadow: isHovered ? '0 18px 36px -6px rgba(220, 38, 38, 0.18)' : '0 8px 24px -4px rgba(0, 0, 0, 0.05)',
        transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="shimmer-overlay" />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: isHovered ? 'linear-gradient(135deg, #dc2626, #f97316)' : 'var(--primary-light)',
            color: isHovered ? '#ffffff' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isHovered ? '0 8px 20px rgba(220, 38, 38, 0.35)' : '0 4px 12px rgba(220, 38, 38, 0.12)',
            transform: isHovered ? 'scale(1.1) rotate(-6deg)' : 'scale(1) rotate(0deg)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          <CategoryIcon slug={category.slug} icon={category.icon} size={26} />
        </div>

        <span className="badge badge-gray" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
          {productCount} {t('category.products_count')}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
          {translatedName}
        </h3>

        {category.children && category.children.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {category.children.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--gray-100)',
                  color: 'var(--gray-700)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                <CategoryIcon slug={sub.slug} icon={sub.icon} size={13} />
                <span>{getTranslatedCategoryName(sub, language)}</span>
              </span>
            ))}
            {category.children.length > 3 && (
              <span style={{ fontSize: '0.725rem', color: 'var(--gray-500)', fontWeight: 600, alignSelf: 'center' }}>
                +{category.children.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
          <span>{t('hero.explore')}</span>
          <ArrowRightIcon
            size={14}
            style={{
              transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>
    </Link>
  )
}

