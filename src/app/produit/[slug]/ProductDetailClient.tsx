'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/components/Toast'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'
import Link from 'next/link'
import { CartIcon, CheckIcon, TagIcon, WhatsAppIcon, ShieldCheckIcon, TruckIcon, PackageIcon } from '@/components/Icons'

interface ProductImage {
  id: string
  url: string
  isMain: boolean
}

interface ProductVariant {
  id: string
  color: string
  reference: string | null
  price: number | null
  oldPrice: number | null
  stock: number
  images: ProductImage[]
}

interface ProductDetailProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    reference: string | null
    price: number | null
    oldPrice: number | null
    stock: number | null
    category: { id: string; name: string; slug: string }
    images: ProductImage[]
    variants?: ProductVariant[]
  }
  whatsappPhone?: string
}

export default function ProductDetailClient({ product, whatsappPhone = '' }: ProductDetailProps) {
  const addItem = useCartStore(s => s.addItem)
  const { showToast } = useToast()
  const { t, language } = useTranslation()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addedToast, setAddedToast] = useState(false)

  const variants = product.variants || []
  const hasVariants = variants.length > 0

  // Intelligent initial selection: select first variant with stock > 0, fallback to 0 if all out of stock
  const firstAvailableIndex = hasVariants ? variants.findIndex(v => (v.stock || 0) > 0) : -1
  const initialVariantIndex = hasVariants ? (firstAvailableIndex !== -1 ? firstAvailableIndex : 0) : -1

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialVariantIndex)

  const selectedVariant = hasVariants && selectedVariantIndex >= 0 ? variants[selectedVariantIndex] : null

  const displayPrice = selectedVariant?.price ?? product.price ?? 0
  const displayOldPrice = selectedVariant?.oldPrice ?? product.oldPrice
  const displayStock = selectedVariant ? (selectedVariant.stock || 0) : (product.stock ?? 0)
  const displayReference = selectedVariant?.reference ?? product.reference

  const variantImages = selectedVariant?.images?.length ? selectedVariant.images : []
  const baseImages = product.images.length > 0 ? product.images : [{ id: 'placeholder', url: '', isMain: true }]
  const displayImages = variantImages.length > 0 ? variantImages : baseImages

  // Reset selected image index when changing variants
  const handleVariantChange = (idx: number) => {
    setSelectedVariantIndex(idx)
    setSelectedImageIndex(0)
  }

  const currentImage = displayImages[selectedImageIndex]?.url || null

  const hasDiscount = displayOldPrice && displayOldPrice > displayPrice
  const discountPercent = hasDiscount ? Math.round(((displayOldPrice! - displayPrice) / displayOldPrice!) * 100) : 0
  const isOutOfStock = displayStock <= 0
  const isLowStock = !isOutOfStock && displayStock <= 3

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      id: product.id,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.color,
      name: product.name,
      price: displayPrice,
      reference: displayReference,
      imageUrl: currentImage,
      stock: displayStock,
    })

    showToast(t('product.added_toast'))
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  const phoneNum = whatsappPhone || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '213797845812'
  const cleanPhone = phoneNum.replace(/\D/g, '')
  const formattedPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone
  const whatsappMsg = `${t('whatsapp.contact_us')}: ${product.name}.${selectedVariant ? ` (${selectedVariant.color}).` : ''}${displayReference ? ` SKU: ${displayReference}.` : ''}`
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`
  const translatedCategoryName = getTranslatedCategoryName(product.category, language)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
      
      {/* Left: Gallery */}
      <div>
        <div style={{ position: 'relative', width: '100%', paddingTop: '85%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--gray-200)', backgroundColor: 'var(--white)', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
            />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)', background: 'var(--gray-100)' }}>
              <PackageIcon size={64} />
            </div>
          )}

          {hasDiscount && (
            <span style={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'var(--primary)', color: 'white', fontWeight: 900, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-primary)' }}>
              -{discountPercent}% {t('product.discount')}
            </span>
          )}
        </div>

        {/* Gallery Thumbnails */}
        {displayImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {displayImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImageIndex(idx)}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: 'var(--radius)',
                  border: selectedImageIndex === idx ? '2.5px solid var(--primary)' : '1px solid var(--gray-200)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'white',
                  flexShrink: 0,
                  transition: 'var(--transition-fast)',
                }}
              >
                {img.url ? (
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}><PackageIcon size={24} /></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Category & SKU */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href={`/categorie/${product.category.slug}`} className="badge badge-primary" style={{ textDecoration: 'none' }}>
            <TagIcon size={12} />
            <span>{translatedCategoryName}</span>
          </Link>

          {displayReference && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontFamily: 'monospace', backgroundColor: 'var(--gray-100)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
              {t('product.reference')}: {displayReference}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-900)', lineHeight: '1.25', letterSpacing: '-0.02em' }}>
          {product.name}
        </h1>

        {/* Price Card */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', padding: '1.25rem 1.5rem', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)' }}>
            {displayPrice.toLocaleString('fr-DZ')} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('product.price_da')}</span>
          </span>
          {hasDiscount && (
            <span style={{ fontSize: '1.15rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
              {displayOldPrice!.toLocaleString('fr-DZ')} {t('product.price_da')}
            </span>
          )}
        </div>

        {/* Variant / Color Selector */}
        {hasVariants && (
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
              {t('product.color_variant')}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {variants.map((variant, idx) => {
                const isVariantOutOfStock = (variant.stock || 0) <= 0
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(idx)}
                    className={`btn ${selectedVariantIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      opacity: isVariantOutOfStock ? 0.6 : 1,
                      position: 'relative',
                    }}
                  >
                    <span>{variant.color}</span>
                    {isVariantOutOfStock && (
                      <span style={{ fontSize: '0.7rem', marginLeft: '4px', opacity: 0.8 }}>({t('product.out_of_stock')})</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Stock Status Indicator */}
        <div style={{ marginTop: hasVariants ? '0' : '0' }}>
          <span className={`badge ${isOutOfStock ? 'badge-gray' : isLowStock ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            {isOutOfStock
              ? t('product.out_of_stock')
              : isLowStock
              ? `${t('product.limited_stock')} : ${displayStock} ${t('product.remaining_qty')}`
              : `${t('product.in_stock')} (${displayStock} ${t('product.available_qty')})`}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{t('product.description')}</h3>
            <p style={{ color: 'var(--gray-600)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Delivery & Payment Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 600 }}>
            <TruckIcon size={20} className="text-primary" />
            <span>{t('nav.delivery_58')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 600 }}>
            <ShieldCheckIcon size={20} className="text-primary" />
            <span>{t('product.cash_payment')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {addedToast && (
            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--mint-light)', color: '#047857', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckIcon size={18} />
              <span>{t('product.added_toast')}</span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn btn-primary btn-lg w-full"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '1.1rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <CartIcon size={22} />
            <span>{isOutOfStock ? t('product.out_of_stock_btn') : t('product.add_to_cart')}</span>
          </button>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg w-full"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#15803d',
                borderColor: '#bbf7d0',
                backgroundColor: '#f0fdf4',
              }}
            >
              <WhatsAppIcon size={18} />
              <span>{t('product.whatsapp_order')}</span>
            </a>
          )}
        </div>

      </div>

    </div>
  )
}

