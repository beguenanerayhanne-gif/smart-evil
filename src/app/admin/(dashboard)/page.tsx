import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  CartIcon,
  ClockIcon,
  PackageIcon,
  TrendingUpIcon,
  PlusIcon,
  TagIcon,
  ArrowRightIcon,
  EyeIcon,
} from '@/components/Icons'

export const metadata = {
  title: 'Tableau de bord - Administration Smart éveil',
}

async function getStats() {
  const [totalOrders, pendingOrders, totalProducts, totalCategories] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'Nouvelle' } }),
    prisma.product.count({ where: { active: true } }),
    prisma.category.count({ where: { active: true } }),
  ])

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      orderItems: { select: { totalLine: true } }
    }
  })

  const totalRevenue = await prisma.order.aggregate({
    where: { status: { in: ['Confirmée', 'En préparation', 'Expédiée', 'Livrée'] } },
    _sum: { totalAmount: true }
  })

  return {
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCategories,
    recentOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
  }
}

const statusColors: Record<string, string> = {
  'Nouvelle': 'badge-primary',
  'Contactée': 'badge-warning',
  'Confirmée': 'badge-success',
  'En préparation': 'badge-warning',
  'Expédiée': 'badge-primary',
  'Livrée': 'badge-success',
  'Annulée': 'badge-danger',
}

export default async function AdminDashboard() {
  const { totalOrders, pendingOrders, totalProducts, totalCategories, recentOrders, totalRevenue } = await getStats()

  const stats = [
    {
      label: 'Commandes totales',
      value: totalOrders.toString(),
      icon: CartIcon,
      accentColor: 'var(--secondary)',
      bgColor: 'var(--secondary-light)',
    },
    {
      label: 'Commandes en attente',
      value: pendingOrders.toString(),
      icon: ClockIcon,
      accentColor: 'var(--accent)',
      bgColor: 'var(--accent-light)',
    },
    {
      label: 'Produits actifs',
      value: totalProducts.toString(),
      icon: PackageIcon,
      accentColor: 'var(--mint)',
      bgColor: 'var(--mint-light)',
    },
    {
      label: 'Chiffre d\'affaires',
      value: `${totalRevenue.toLocaleString('fr-DZ')} DA`,
      icon: TrendingUpIcon,
      accentColor: 'var(--purple)',
      bgColor: 'var(--purple-light)',
    },
  ]

  return (
    <div>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            Tableau de bord
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Vue d&apos;ensemble et indicateurs clés de votre boutique Smart éveil
          </p>
        </div>

        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          <PlusIcon size={18} />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* Statistics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div
              key={stat.label}
              className="card card-body"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.35rem',
                border: '1px solid var(--gray-200)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: stat.bgColor,
                  color: stat.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <StatIcon size={24} />
              </div>

              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.2rem' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1.1 }}>
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid: Recent Orders + Catalog Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Recent Orders Section */}
        <div className="card">
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--white)',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                Commandes Récentes
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                Les dernières commandes enregistrées sur la boutique
              </p>
            </div>

            <Link href="/admin/commandes" className="btn btn-secondary btn-sm">
              <span>Voir tout</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <CartIcon size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>Aucune commande pour le moment</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Les nouvelles commandes passées par les clients s afficheront ici.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Client</th>
                    <th>Wilaya</th>
                    <th>Date</th>
                    <th>Montant Total</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-semibold" style={{ color: 'var(--primary)' }}>
                        {order.orderNumber}
                      </td>
                      <td className="font-medium">{order.customerName}</td>
                      <td>{order.wilaya}</td>
                      <td className="text-muted text-sm">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="font-semibold">{order.totalAmount.toLocaleString('fr-DZ')} DA</td>
                      <td>
                        <span className={`badge ${statusColors[order.status] ?? 'badge-gray'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/commandes/${order.id}`} className="btn btn-secondary btn-sm">
                          <EyeIcon size={14} />
                          <span>Détails</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catalogue Overview Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          <Link
            href="/admin/categories"
            className="card card-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.35rem',
              textDecoration: 'none',
              border: '1px solid var(--gray-200)',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TagIcon size={22} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>Catégories</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{totalCategories} catégorie(s) enregistrée(s)</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted" />
          </Link>

          <Link
            href="/admin/produits"
            className="card card-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.35rem',
              textDecoration: 'none',
              border: '1px solid var(--gray-200)',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius)', backgroundColor: 'var(--mint-light)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PackageIcon size={22} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>Produits au Catalogue</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{totalProducts} produit(s) actif(s)</p>
              </div>
            </div>
            <ArrowRightIcon size={18} className="text-muted" />
          </Link>

        </div>

      </div>
    </div>
  )
}
