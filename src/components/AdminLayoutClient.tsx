'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logoutAction } from '@/app/admin/login/actions'
import {
  DashboardIcon,
  CartIcon,
  PackageIcon,
  TagIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  FileSpreadsheetIcon,
} from '@/components/Icons'

interface NavGroup {
  label: string
  items: {
    href: string
    label: string
    icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Tableau de bord',
    items: [
      { href: '/admin', label: "Vue d'ensemble", icon: DashboardIcon },
    ]
  },
  {
    label: 'Ventes',
    items: [
      { href: '/admin/commandes', label: 'Commandes', icon: CartIcon },
    ]
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/produits', label: 'Produits', icon: PackageIcon },
      { href: '/admin/produits/importer', label: 'Importer CSV', icon: FileSpreadsheetIcon },
      { href: '/admin/categories', label: 'Catégories', icon: TagIcon },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/parametres', label: 'Paramètres Boutique', icon: SettingsIcon },
      { href: '/admin/administrateurs', label: 'Administrateurs', icon: UserIcon },
    ]
  }
]

// Pages where the sidebar starts collapsed for a wider content area
const WIDE_PAGES = ['/admin/produits/importer']

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.25s ease', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function SidebarContent({
  collapsed,
  onNavClick,
}: {
  collapsed?: boolean
  onNavClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logoutAction()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Logo */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#070f1a', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} onClick={onNavClick}>
          <img
            src="/logo.png"
            alt="Smart éveil Admin"
            style={{ height: '36px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '1.25rem' }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                color: '#475569',
                padding: '0.5rem 0.85rem 0.35rem',
              }}>
                {group.label}
              </div>
            )}

            {group.items.map((item) => {
              const IconComp = item.icon
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '0.75rem',
                    padding: collapsed ? '0.65rem' : '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(220, 38, 38, 0.18)' : 'transparent',
                    borderLeft: collapsed ? 'none' : isActive ? '3px solid #dc2626' : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '0.1rem',
                  }}
                >
                  <IconComp size={17} style={{ color: isActive ? '#dc2626' : '#64748b', flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.07)', backgroundColor: '#070f1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0 0.1rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem', flexShrink: 0,
            }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Administrateur
              </p>
              <p style={{ fontSize: '0.7rem', color: '#475569' }}>smart-eveil.dz</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 0.75rem', borderRadius: '7px',
              fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8',
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <LogOutIcon size={15} />
            <span>{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
          </button>
        </div>
      )}

      {/* Footer collapsed: just logout icon */}
      {collapsed && (
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Se déconnecter"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '8px',
              fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8',
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            <LogOutIcon size={15} />
          </button>
        </div>
      )}
    </>
  )
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Collapse sidebar when on wide pages (import grid), otherwise expanded
  const [collapsed, setCollapsed] = useState(() => WIDE_PAGES.some(p => pathname.startsWith(p)))

  // Auto-collapse when navigating to import page; auto-expand when leaving
  useEffect(() => {
    setMobileOpen(false)
    if (WIDE_PAGES.some(p => pathname.startsWith(p))) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [pathname])

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const sidebarWidth = collapsed ? '64px' : '240px'

  return (
    <div className="admin-layout" style={{ '--sidebar-w': sidebarWidth } as React.CSSProperties}>
      {/* Desktop sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle button at bottom of sidebar */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.65rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'transparent',
            border: 'none',
            // borderTop duplicate removed
            color: '#475569',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
        >
          <CollapseIcon collapsed={collapsed} />
          {!collapsed && <span>Réduire</span>}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
          }}
        />
      )}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '260px', zIndex: 200,
          backgroundColor: '#0b192c', color: 'white',
          display: 'flex', flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: mobileOpen ? '0 0 40px rgba(0,0,0,0.35)' : 'none',
        }}
        className="admin-sidebar-mobile"
      >
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main content area */}
      <div
        className="admin-main"
        style={{
          flex: 1,
          minWidth: 0,
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="admin-hamburger"
              aria-label="Ouvrir le menu"
              style={{
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '8px',
                border: '1px solid var(--gray-200)', background: 'var(--white)',
                cursor: 'pointer', color: 'var(--gray-700)',
              }}
            >
              {mobileOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)' }}>
                Back-Office Smart éveil
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
            >
              Voir le site ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
