'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logoutAction } from '@/app/admin/login/actions'
import { useState } from 'react'
import {
  DashboardIcon,
  CartIcon,
  PackageIcon,
  TagIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
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
      { href: '/admin', label: 'Vue d\'ensemble', icon: DashboardIcon },
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

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logoutAction()
    router.push('/admin/login')
  }

  return (
    <aside className="admin-sidebar">
      {/* Logo Container */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#081220' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Smart éveil Admin"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', padding: '0.5rem 0.85rem 0.35rem' }}>
              {group.label}
            </div>

            {group.items.map((item) => {
              const IconComp = item.icon
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(220, 38, 38, 0.18)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                    marginBottom: '0.15rem',
                  }}
                >
                  <IconComp size={18} style={{ color: isActive ? 'var(--primary)' : '#64748b' }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#081220' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            A
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Administrateur
            </p>
            <p style={{ fontSize: '0.725rem', color: '#64748b' }}>smart-eveil-admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#cbd5e1',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          <LogOutIcon size={16} />
          <span>{loading ? 'Déconnexion...' : 'Se déconnecter'}</span>
        </button>
      </div>
    </aside>
  )
}
