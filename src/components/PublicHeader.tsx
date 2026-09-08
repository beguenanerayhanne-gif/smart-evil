'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import { useCartStore } from '@/store/cartStore'
import {
  SearchIcon,
  CartIcon,
  WhatsAppIcon,
  MenuIcon,
  CloseIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon,
  PackageIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@/components/Icons'

import LanguageSelector from '@/components/LanguageSelector'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getTranslatedCategoryName } from '@/lib/i18n/translations'
import CategoryIcon from '@/components/CategoryIcon'

export interface HeaderCategory {
  id: string
  name: string
  slug: string
  icon?: string | null
  order?: number
  parentId?: string | null
  children?: HeaderCategory[]
  _count?: { products: number }
}

export default function PublicHeader({
  shopName = 'Smart éveil',
  whatsappPhone = '',
  categories = [],
}: {
  categories?: HeaderCategory[]
  shopName?: string
  whatsappPhone?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, dir, language } = useTranslation()
  const [q, setQ] = useState('')
  const [, startTransition] = useTransition()
  
  const cartItems = useCartStore(s => s.items)
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'categories' | 'menu'>('categories')
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    startTransition(() => {
      router.push(`/produits?q=${encodeURIComponent(q.trim())}`)
      setQ('')
      setDrawerOpen(false)
    })
  }

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const targetPhone = whatsappPhone || '0556901248'
  const cleanPhone = targetPhone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone}`

  // Separate top-level categories if nested structure not provided
  const mainCategories = categories.filter(c => !c.parentId || c.parentId === null)

  return (
    <>
      {/* Top Bar Announcement */}
      <div style={{ backgroundColor: 'var(--gray-900)', color: 'var(--gray-300)', fontSize: '0.8125rem', padding: '0.45rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TruckIcon size={15} style={{ color: 'var(--accent)' }} />
              <span>{t('nav.delivery_58')}</span>
            </div>
            <span style={{ opacity: 0.3 }} className="hide-mobile">|</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} className="hide-mobile">
              <ShieldCheckIcon size={15} style={{ color: 'var(--mint)' }} />
              <span style={{ color: 'var(--mint-light)', fontWeight: 600 }}>{t('nav.cash_on_delivery')}</span>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-xs)',
          transition: 'var(--transition)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: scrolled ? '64px' : '76px', transition: 'var(--transition)', gap: '1.25rem' }}>
          
          {/* Left Actions / Logo Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Menu Trigger Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-800)',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              aria-label="Ouvrir le menu navigation"
            >
              <MenuIcon size={22} />
              <span className="hide-mobile" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('nav.menu')}</span>
            </button>

            {/* Shop Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src="/logo.png"
                alt={shopName}
                style={{
                  height: scrolled ? '40px' : '50px',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'var(--transition)',
                }}
              />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="desktop-search" style={{ flex: 1, maxWidth: '420px', margin: '0 1rem' }}>
            <form onSubmit={handleSearch}>
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
          </div>

          {/* Right Header Navigation & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Desktop Navigation Links */}
            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginRight: '0.5rem' }}>
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  fontWeight: pathname === '/' ? 800 : 600,
                  color: pathname === '/' ? 'var(--primary)' : 'var(--gray-700)',
                  fontSize: '0.9rem',
                }}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/produits"
                style={{
                  textDecoration: 'none',
                  fontWeight: pathname.startsWith('/produit') ? 800 : 600,
                  color: pathname.startsWith('/produit') ? 'var(--primary)' : 'var(--gray-700)',
                  fontSize: '0.9rem',
                }}
              >
                {t('nav.products')}
              </Link>
              <Link
                href="/categories"
                style={{
                  textDecoration: 'none',
                  fontWeight: pathname.startsWith('/categorie') ? 800 : 600,
                  color: pathname.startsWith('/categorie') ? 'var(--primary)' : 'var(--gray-700)',
                  fontSize: '0.9rem',
                }}
              >
                {t('nav.categories')}
              </Link>
            </nav>

            {/* WhatsApp Link Button */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm hide-mobile"
                style={{ backgroundColor: '#25D366', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                title="Conseiller WhatsApp"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Cart Button */}
            <Link
              href="/panier"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                transition: 'var(--transition)',
                boxShadow: totalQuantity > 0 ? 'var(--shadow-primary)' : 'none',
              }}
            >
              <CartIcon size={19} />
              <span className="hide-mobile">{t('nav.cart')}</span>
              {totalQuantity > 0 && (
                <span
                  key={totalQuantity}
                  className="animate-pop"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    minWidth: '22px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>

        </div>

        {/* Mobile quick search row below sticky header */}
        <div className="mobile-search-bar">
          <form onSubmit={handleSearch}>
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
        </div>
      </header>

      {/* ================================================== */}
      {/* MOBILE DRAWER NAVIGATION (RTL & LTR SUPPORTED) */}
      {/* ================================================== */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden' }}>
          
          {/* Dimmed Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(11, 25, 44, 0.65)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.25s ease forwards',
            }}
          />

          {/* Drawer Side Panel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: dir === 'rtl' ? 'auto' : 0,
              right: dir === 'rtl' ? 0 : 'auto',
              bottom: 0,
              width: '88vw',
              maxWidth: '380px',
              backgroundColor: 'var(--white)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
              animation: dir === 'rtl' ? 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            
            {/* Drawer Top Header */}
            <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <img src="/logo.png" alt={shopName} style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray-700)',
                    cursor: 'pointer',
                  }}
                  aria-label={t('nav.close')}
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              {/* Search Bar inside Drawer */}
              <form onSubmit={handleSearch}>
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
                    style={{ backgroundColor: 'var(--white)', border: '1.5px solid var(--gray-200)' }}
                  />
                </div>
              </form>
            </div>

            {/* Navigation Tabs: CATÉGORIES | MENU */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-200)', backgroundColor: 'var(--white)' }}>
              <button
                onClick={() => setActiveTab('categories')}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderBottom: activeTab === 'categories' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'categories' ? 'var(--primary)' : 'var(--gray-500)',
                  backgroundColor: activeTab === 'categories' ? 'var(--white)' : 'var(--gray-50)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {t('nav.categories_tab')}
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderBottom: activeTab === 'menu' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'menu' ? 'var(--primary)' : 'var(--gray-500)',
                  backgroundColor: activeTab === 'menu' ? 'var(--white)' : 'var(--gray-50)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {t('nav.menu_tab')}
              </button>
            </div>

            {/* Drawer Body Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              
              {activeTab === 'categories' ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Global Link: TOUS LES JOUETS */}
                  <div style={{ borderBottom: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)' }}>
                    <Link
                      href="/produits"
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1.25rem',
                        textDecoration: 'none',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '0.925rem',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon slug="tous" size={20} />
                      </div>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('nav.all_toys_link')}</span>
                    </Link>
                  </div>

                  {mainCategories.length === 0 ? (
                    <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                      <PackageIcon size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                      <p>{t('product.loading_categories')}</p>
                    </div>
                  ) : (
                    mainCategories.map((cat) => {
                      const hasChildren = cat.children && cat.children.length > 0
                      const isExpanded = expandedCats[cat.id]

                      return (
                        <div key={cat.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1.25rem',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)',
                              backgroundColor: isExpanded ? 'var(--gray-50)' : 'transparent',
                            }}
                          >
                            <Link
                              href={`/categorie/${cat.slug}`}
                              onClick={() => setDrawerOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', flex: 1, color: 'var(--gray-900)', fontWeight: 700, fontSize: '0.925rem' }}
                            >
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--gray-100)',
                                  color: 'var(--gray-700)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <CategoryIcon slug={cat.slug} icon={cat.icon} size={20} />
                              </div>
                              <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em', fontSize: '0.875rem' }}>{getTranslatedCategoryName(cat, language)}</span>
                            </Link>

                            {hasChildren && (
                              <button
                                onClick={(e) => toggleExpand(cat.id, e)}
                                style={{
                                  padding: '0.4rem 0.6rem',
                                  color: 'var(--gray-600)',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isExpanded ? 'var(--gray-200)' : 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                                aria-label="Dérouler les sous-catégories"
                              >
                                <span style={{ opacity: 0.7 }}>{cat.children!.length}</span>
                                {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                              </button>
                            )}
                          </div>

                          {/* Sub-categories tree */}
                          {hasChildren && isExpanded && (
                            <div style={{ backgroundColor: 'var(--gray-50)', padding: dir === 'rtl' ? '0.35rem 3.5rem 0.5rem 0' : '0.35rem 0 0.5rem 3.5rem', borderTop: '1px solid var(--gray-200)' }}>
                              {cat.children!.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categorie/${subcat.slug}`}
                                  onClick={() => setDrawerOpen(false)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.55rem 0.75rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--gray-700)',
                                    textDecoration: 'none',
                                    borderLeft: dir === 'rtl' ? 'none' : '2px solid var(--gray-300)',
                                    borderRight: dir === 'rtl' ? '2px solid var(--gray-300)' : 'none',
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  <CategoryIcon slug={subcat.slug} icon={subcat.icon} size={15} />
                                  <span>{getTranslatedCategoryName(subcat, language)}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              ) : (
                /* MENU Tab */
                <nav style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 1.25rem', gap: '0.5rem' }}>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, color: 'var(--gray-800)', backgroundColor: 'var(--gray-50)', fontSize: '0.925rem' }}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    href="/produits"
                    onClick={() => setDrawerOpen(false)}
                    style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, color: 'var(--gray-800)', backgroundColor: 'var(--gray-50)', fontSize: '0.925rem' }}
                  >
                    {t('nav.products')}
                  </Link>
                  <Link
                    href="/categories"
                    onClick={() => setDrawerOpen(false)}
                    style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, color: 'var(--gray-800)', backgroundColor: 'var(--gray-50)', fontSize: '0.925rem' }}
                  >
                    {t('nav.categories')}
                  </Link>
                  <Link
                    href="/panier"
                    onClick={() => setDrawerOpen(false)}
                    style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, color: 'var(--gray-800)', backgroundColor: 'var(--gray-50)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>{t('nav.cart')}</span>
                    {totalQuantity > 0 && <span className="badge badge-primary">{totalQuantity}</span>}
                  </Link>

                  {/* Language selection inside Mobile Drawer */}
                  <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)' }}>{t('nav.select_language')}</span>
                    <LanguageSelector />
                  </div>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 800, color: 'white', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                      <WhatsAppIcon size={20} />
                      <span>{t('whatsapp.floating_button')}</span>
                    </a>
                  )}
                </nav>
              )}

            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--gray-200)', backgroundColor: 'var(--gray-50)', fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'center' }}>
              © {new Date().getFullYear()} {shopName} • {t('nav.delivery_58')}
            </div>

          </div>

        </div>
      )}
    </>
  )
}
