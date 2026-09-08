'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { SearchIcon } from '@/components/Icons'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'
import CategoryIcon from '@/components/CategoryIcon'

export interface FilterCategory {
  id: string
  name: string
  slug: string
  icon?: string | null
}

interface CatalogFiltersProps {
  categories: FilterCategory[]
  selectedCategorySlug?: string
  initialQuery?: string
  initialSort?: string
}

export default function CatalogFilters({
  categories,
  selectedCategorySlug = '',
  initialQuery = '',
  initialSort = 'newest',
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useTranslation()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(initialQuery)
  const [sort, setSort] = useState(initialSort)

  const updateFilters = (newParams: { q?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) {
        params.set('q', newParams.q.trim())
      } else {
        params.delete('q')
      }
    }

    if (newParams.category !== undefined) {
      if (newParams.category) {
        params.set('category', newParams.category)
      } else {
        params.delete('category')
      }
    }

    if (newParams.sort !== undefined) {
      if (newParams.sort && newParams.sort !== 'newest') {
        params.set('sort', newParams.sort)
      } else {
        params.delete('sort')
      }
    }

    startTransition(() => {
      router.push(`/produits?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    setSort(newSort)
    updateFilters({ sort: newSort })
  }

  return (
    <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      
      {/* Search Input & Sort Selector Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '520px' }}>
          <div className="search-wrapper">
            <span className="search-icon">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              placeholder={t('nav.search_placeholder')}
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </form>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>
            {t('catalogue.sort_by')} :
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={handleSortChange}
            className="form-select"
            style={{ padding: '0.45rem 2rem 0.45rem 0.85rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius)' }}
          >
            <option value="newest">{t('catalogue.sort_newest')}</option>
            <option value="price-asc">{t('catalogue.sort_price_asc')}</option>
            <option value="price-desc">{t('catalogue.sort_price_desc')}</option>
            <option value="name-asc">{t('catalogue.sort_name_asc')}</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => updateFilters({ category: '' })}
          style={{
            padding: '0.5rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: !selectedCategorySlug ? 'var(--primary)' : 'var(--white)',
            color: !selectedCategorySlug ? 'white' : 'var(--gray-700)',
            border: !selectedCategorySlug ? '1px solid var(--primary)' : '1px solid var(--gray-200)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'var(--transition-fast)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <CategoryIcon slug="tous" size={16} />
          <span>{t('catalogue.all_products')}</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug
          const translatedName = getTranslatedCategoryName(cat, language)

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters({ category: cat.slug })}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--white)',
                color: isSelected ? 'white' : 'var(--gray-700)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--gray-200)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'var(--transition-fast)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <CategoryIcon slug={cat.slug} icon={cat.icon} size={16} />
              <span>{translatedName}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
