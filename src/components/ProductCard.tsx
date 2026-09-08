'use client'

import { useState, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/components/Toast'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'
import Link from 'next/link'
import { CartIcon, CheckIcon, PackageIcon } from '@/components/Icons'

interface ProductProps {
  id: string
  name: string
  slug: string
  price: number | null
  oldPrice?: number | null
  stock?: number | null
  reference?: string | null
  category: { name: string; slug?: string }
  images: { url: string }[]
  variants?: { id?: string; stock: number }[]
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const addItem = useCartStore(s => s.addItem)
  const { showToast } = useToast()
  const { t, language } = useTranslation()
  const [added, setAdded] = useState(false)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const cardRef = useRef<HTMLDivElement>(null)

  const productUrl = `/produit/${product.slug || product.id}`
  const mainImage = product.images[0]?.url ?? null
  const displayPrice = product.price ?? 0

  // Calculate real stock: sum of variant stocks if present, otherwise product stock
  const effectiveStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : (product.stock ?? 0)

  const isOutOfStock = effectiveStock <= 0
  const isLowStock = !isOutOfStock && effectiveStock <= 3

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    setTilt({ rotateX, rotateY, scale: 1.02 })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 })
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) return

    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      reference: product.reference ?? null,
      imageUrl: mainImage,
      stock: effectiveStock,
    })

    showToast(t('product.added_toast'))

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const hasDiscount = product.oldPrice && product.oldPrice > displayPrice
  const discountPercent = hasDiscount ? Math.round(((product.oldPrice! - displayPrice) / product.oldPrice!) * 100) : 0
  const translatedCategoryName = getTranslatedCategoryName({ slug: product.category.slug || '', name: product.category.name }, language)

  return (
    <div
      ref={cardRef}
      className="card card-3d-perspective"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        backgroundColor: 'var(--white)',
        overflow: 'hidden',
        position: 'relative',
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        boxShadow: tilt.scale > 1 ? '0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(220, 38, 38, 0.08)' : 'var(--shadow-sm)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* Product Image */}
      <Link
        href={productUrl}
        className="shimmer-container"
        style={{ position: 'relative', display: 'block', paddingTop: '85%', background: 'var(--gray-50)', overflow: 'hidden' }}
      >
        <div className="shimmer-overlay" />
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: tilt.scale > 1 ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', background: 'var(--gray-100)' }}>
            <PackageIcon size={40} />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.725rem',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
              zIndex: 3,
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--gray-800)', color: 'white', fontWeight: 700, fontSize: '0.6875rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', zIndex: 3 }}>
            {t('product.out_of_stock')}
          </span>
        ) : isLowStock ? (
          <span className="badge-pulse-danger" style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: '0.6875rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', zIndex: 3 }}>
            {t('product.limited_stock')}
          </span>
        ) : null}
      </Link>

      {/* Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {translatedCategoryName}
          </span>

          <Link href={productUrl} style={{ textDecoration: 'none', color: 'var(--gray-900)' }}>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, margin: '0.35rem 0 0.5rem 0', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7em' }}>
              {product.name}
            </h3>
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gray-900)' }}>
              {displayPrice.toLocaleString('fr-DZ')} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('product.price_da')}</span>
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                {product.oldPrice!.toLocaleString('fr-DZ')} {t('product.price_da')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`btn w-full shimmer-container ${added ? 'btn-secondary animate-pop' : 'btn-primary'}`}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.65rem 1rem',
              fontSize: '0.85rem',
              backgroundColor: added ? 'var(--mint)' : undefined,
              borderColor: added ? 'var(--mint)' : undefined,
              color: added ? 'white' : undefined,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer-overlay" />
            {added ? (
              <>
                <CheckIcon size={16} className="animate-pop" />
                <span>{t('product.added_toast')}</span>
              </>
            ) : isOutOfStock ? (
              <span>{t('product.out_of_stock')}</span>
            ) : (
              <>
                <CartIcon size={16} />
                <span>{t('product.add_to_cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

