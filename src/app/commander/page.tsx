'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { placeOrder } from './actions'
import { WILAYAS } from '@/lib/wilayas'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { ShieldCheckIcon, TruckIcon, WhatsAppIcon, CheckIcon, PackageIcon, ArrowRightIcon } from '@/components/Icons'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { t, dir } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ orderNumber: string; customerName: string; totalAmount: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const result = await placeOrder(formData, items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      reference: i.reference,
      quantity: i.quantity,
      variantId: i.variantId,
      variantName: i.variantName,
    })))

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.orderNumber) {
      const orderTotal = total()
      const name = formData.get('customerName') as string
      clearCart()
      setSuccess({
        orderNumber: result.orderNumber,
        customerName: name,
        totalAmount: orderTotal,
      })
    }
  }

  if (success) {
    const whatsappMessage = encodeURIComponent(
      `Bonjour Smart éveil ! Je viens de passer la commande N° ${success.orderNumber} au nom de ${success.customerName} pour un total de ${success.totalAmount.toLocaleString('fr-DZ')} DA. Merci !`
    )
    const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '213797845812'

    return (
      <>
        <PublicHeader />
        <main className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
          <div className="card card-body" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--mint-light)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckIcon size={40} />
            </div>
            
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
              {t('checkout.success_title')}
            </h1>
            
            <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {t('checkout.success_desc', { orderNumber: success.orderNumber })}
            </p>

            <div style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem', border: '1px solid #fecdd3' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {t('checkout.order_number')}
              </p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {success.orderNumber}
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--gray-700)', textAlign: dir === 'rtl' ? 'right' : 'left', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontWeight: 800, marginBottom: '0.75rem', color: 'var(--gray-900)', fontSize: '0.95rem' }}>
                {t('nav.delivery_58')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheckIcon size={18} className="text-primary" />
                  <span>{t('trust.fast_delivery_sub')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <TruckIcon size={18} className="text-primary" />
                  <span>{t('trust.fast_delivery')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckIcon size={18} className="text-primary" />
                  <span>{t('trust.cash_payment')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/${waPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg"
                style={{ backgroundColor: '#25D366', color: 'white', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
              >
                <WhatsAppIcon size={22} />
                <span>{t('whatsapp.contact_us')}</span>
              </a>

              <Link href="/" className="btn btn-secondary btn-lg">
                <span>{t('checkout.back_home')}</span>
              </Link>
            </div>

          </div>
        </main>
        <PublicFooter />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <main className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem', textAlign: 'center' }}>
          <div className="card card-body" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>{t('cart.empty_title')}</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{t('cart.empty_desc')}</p>
            <Link href="/produits" className="btn btn-primary">
              <PackageIcon size={18} />
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
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--gray-900)' }}>{t('checkout.title')}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{t('checkout.subtitle')}</p>
          </div>
          <Link href="/panier" className="btn btn-secondary">
            <span>← {t('cart.title')}</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'start' }} className="checkout-grid">
          <style jsx>{`
            @media (min-width: 992px) {
              .checkout-grid {
                grid-template-columns: 1fr 380px !important;
              }
            }
          `}</style>

          {/* Form */}
          <div className="card card-body">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TruckIcon size={22} className="text-primary" />
              <span>{t('checkout.customer_info')}</span>
            </h2>

            {error && (
              <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="customerName">{t('checkout.full_name')} *</label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    className="form-input"
                    placeholder={t('checkout.full_name_placeholder')}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="customerPhone">{t('checkout.phone')} *</label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    className="form-input"
                    placeholder={t('checkout.phone_placeholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="wilaya">{t('checkout.wilaya')} *</label>
                  <select id="wilaya" name="wilaya" className="form-select" required defaultValue="">
                    <option value="" disabled>— {t('checkout.select_wilaya')} —</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="commune">{t('checkout.commune')} *</label>
                  <input
                    id="commune"
                    name="commune"
                    type="text"
                    className="form-input"
                    placeholder={t('checkout.commune_placeholder')}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="address">{t('checkout.address')}</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    placeholder={t('checkout.address_placeholder')}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="message">{t('checkout.notes')}</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    rows={3}
                    placeholder={t('checkout.notes_placeholder')}
                  />
                </div>

              </div>

              <div style={{ borderTop: '1px dashed var(--gray-200)', margin: '1.5rem 0' }} />

              <div style={{ backgroundColor: 'var(--mint-light)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 600 }}>
                <ShieldCheckIcon size={22} style={{ flexShrink: 0 }} />
                <span>{t('product.cash_payment')}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <span>{t('checkout.placing_order')}</span>
                ) : (
                  <>
                    <span>{t('checkout.place_order')}</span>
                    <ArrowRightIcon size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary */}
          <div className="card card-body" style={{ position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--gray-900)' }}>
              {t('checkout.order_summary')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {items.map(item => {
                const key = `${item.id}-${item.variantId || ''}-${item.variantName || ''}`
                return (
                  <div key={key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-100)', flexShrink: 0 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PackageIcon size={20} className="text-muted" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name} {item.variantName ? `(${item.variantName})` : ''}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>{t('cart.item_qty')}: {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--gray-900)', flexShrink: 0 }}>
                      {(item.price * item.quantity).toLocaleString('fr-DZ')} {t('product.price_da')}
                    </p>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px dashed var(--gray-200)', margin: '1rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)' }}>{t('cart.total')}</span>
              <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--primary)' }}>
                {total().toLocaleString('fr-DZ')} {t('product.price_da')}
              </span>
            </div>

          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  )
}
