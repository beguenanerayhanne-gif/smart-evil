'use client'

import { useCartStore } from '@/store/cartStore'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { CartIcon, TrashIcon, ArrowRightIcon, ShieldCheckIcon, PackageIcon } from '@/components/Icons'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()
  const { t } = useTranslation()
  const router = useRouter()

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push('/commander')
  }

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <main className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
          <div className="card card-body" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CartIcon size={36} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              {t('cart.empty_title')}
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {t('cart.empty_desc')}
            </p>
            <Link href="/produits" className="btn btn-primary btn-lg">
              <PackageIcon size={20} />
              <span>{t('cart.continue_shopping')}</span>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </>
    )
  }

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--gray-900)' }}>{t('cart.title')}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {items.length} {t('nav.cart')}
            </p>
          </div>
          <Link href="/produits" className="btn btn-secondary">
            <span>← {t('cart.continue_shopping')}</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'start' }} className="cart-grid">
          <style jsx>{`
            @media (min-width: 992px) {
              .cart-grid {
                grid-template-columns: 1fr 380px !important;
              }
            }
          `}</style>

          {/* Items List */}
          <div className="card">
            {items.map((item, i) => {
              const itemKey = `${item.id}-${item.variantId || ''}-${item.variantName || ''}`
              const isMaxStock = item.stock !== undefined && item.quantity >= item.stock

              return (
                <div
                  key={itemKey}
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    borderBottom: i < items.length - 1 ? '1px solid var(--gray-200)' : 'none',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      border: '1px solid var(--gray-200)',
                      backgroundColor: 'var(--gray-100)',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PackageIcon size={28} className="text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                      {item.name}
                      {item.variantName && (
                        <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                          {item.variantName}
                        </span>
                      )}
                    </h3>
                    {item.reference && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>
                        SKU: {item.reference}
                      </p>
                    )}
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.35rem' }}>
                      {item.price.toLocaleString('fr-DZ')} {t('product.price_da')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--gray-100)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.variantName)}
                        style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--white)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-800)', boxShadow: 'var(--shadow-xs)' }}
                        aria-label="Diminuer"
                      >
                        −
                      </button>
                      <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.variantName)}
                        disabled={isMaxStock}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isMaxStock ? 'var(--gray-200)' : 'var(--white)',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          color: isMaxStock ? 'var(--gray-400)' : 'var(--gray-800)',
                          boxShadow: isMaxStock ? 'none' : 'var(--shadow-xs)',
                          cursor: isMaxStock ? 'not-allowed' : 'pointer'
                        }}
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>
                    {item.stock !== undefined && (
                      <span style={{ fontSize: '0.7rem', color: isMaxStock ? 'var(--danger)' : 'var(--gray-400)', fontWeight: 600 }}>
                        Max: {item.stock}
                      </span>
                    )}
                  </div>

                  {/* Item Subtotal & Remove */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '100px' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)' }}>
                      {(item.price * item.quantity).toLocaleString('fr-DZ')} {t('product.price_da')}
                    </p>
                    <button
                      onClick={() => removeItem(item.id, item.variantId, item.variantName)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <TrashIcon size={14} />
                      <span>{t('cart.remove_item')}</span>
                    </button>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Cart Summary Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px' }}>
            <div className="card card-body">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--gray-900)' }}>
                {t('cart.summary')}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {items.map(item => {
                  const key = `${item.id}-${item.variantId || ''}-${item.variantName || ''}`
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {item.name} {item.variantName ? `(${item.variantName})` : ''} <strong style={{ color: 'var(--gray-900)' }}>× {item.quantity}</strong>
                      </span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString('fr-DZ')} {t('product.price_da')}</span>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px dashed var(--gray-200)', margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)' }}>{t('cart.total')}</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--primary)' }}>
                  {total().toLocaleString('fr-DZ')} {t('product.price_da')}
                </span>
              </div>

              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--mint-light)', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                <ShieldCheckIcon size={20} style={{ flexShrink: 0 }} />
                <span>{t('product.cash_payment')}</span>
              </div>

              <button onClick={handleCheckout} className="btn btn-primary btn-lg w-full">
                <span>{t('cart.proceed_checkout')}</span>
                <ArrowRightIcon size={20} />
              </button>

              <button
                onClick={clearCart}
                className="btn btn-ghost w-full"
                style={{ marginTop: '0.75rem', color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                {t('cart.clear')}
              </button>

            </div>
          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  )
}
