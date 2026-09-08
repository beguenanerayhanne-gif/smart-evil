'use client'

import Link from 'next/link'
import { WhatsAppIcon, PhoneIcon, TruckIcon, ShieldCheckIcon, FacebookIcon, InstagramIcon } from '@/components/Icons'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'

interface PublicFooterProps {
  shopName?: string
  contactPhone?: string
  contactAddress?: string
  categories?: { id: string; name: string; slug: string }[]
}

export default function PublicFooter({
  shopName = 'Smart éveil',
  contactPhone = '',
  contactAddress = '',
  categories = [],
}: PublicFooterProps) {
  const { t, language } = useTranslation()
  const phoneNum = contactPhone || '0556901248'
  const cleanPhone = phoneNum.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone}`

  return (
    <footer style={{ backgroundColor: 'var(--gray-900)', color: 'var(--gray-400)', paddingTop: '4rem', paddingBottom: '2.5rem', marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        
        {/* Col 1: Shop Info & Socials */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <img src="/logo.png" alt={shopName} style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>

          <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem', color: 'var(--gray-400)' }}>
            {t('footer.about_desc')}
          </p>

          {/* Social Media & WhatsApp Links (Minimalist & Sleek) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 211, 102, 0.15)',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                title="WhatsApp - 0556901248"
              >
                <WhatsAppIcon size={18} />
              </a>
            )}

            <a
              href="https://www.facebook.com/smarteveil"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(24, 119, 242, 0.15)',
                color: '#1877F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              title="Facebook - Smart Éveil Magasin de Jouets"
            >
              <FacebookIcon size={17} />
            </a>

            <a
              href="https://www.instagram.com/magasindejouetssmarteveil"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(225, 48, 108, 0.15)',
                color: '#E1306C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              title="Instagram - Magasin de Jouets Smart Éveil"
            >
              <InstagramIcon size={17} />
            </a>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>{t('footer.quick_links')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
            <li><Link href="/" style={{ color: 'var(--gray-400)', textDecoration: 'none', transition: 'var(--transition-fast)' }}>{t('nav.home')}</Link></li>
            <li><Link href="/produits" style={{ color: 'var(--gray-400)', textDecoration: 'none', transition: 'var(--transition-fast)' }}>{t('nav.products')}</Link></li>
            <li><Link href="/categories" style={{ color: 'var(--gray-400)', textDecoration: 'none', transition: 'var(--transition-fast)' }}>{t('nav.categories')}</Link></li>
          </ul>
        </div>

        {/* Col 3: Categories */}
        {categories.length > 0 && (
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>{t('hero.our_categories')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link href={`/categorie/${cat.slug}`} style={{ color: 'var(--gray-400)', textDecoration: 'none', transition: 'var(--transition-fast)' }}>
                    {getTranslatedCategoryName(cat, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Col 4: Service & Guarantees */}
        <div>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>{t('footer.contact')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TruckIcon size={18} className="text-primary" />
              <span>{t('product.delivery_58')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheckIcon size={18} className="text-primary" />
              <span>{t('product.cash_payment')}</span>
            </div>
            {contactPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneIcon size={18} className="text-primary" />
                <span>{contactPhone}</span>
              </div>
            )}
            {contactAddress && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                {contactAddress}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        © {new Date().getFullYear()} {shopName}. {t('footer.rights')}
      </div>
    </footer>
  )
}
