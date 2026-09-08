import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SearchIcon, PackageIcon } from '@/components/Icons'

export const metadata = {
  title: 'Commandes - Administration Smart éveil',
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

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const params = await searchParams
  const { status, q } = params

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (q) where.OR = [
    { orderNumber: { contains: q, mode: 'insensitive' } },
    { customerName: { contains: q, mode: 'insensitive' } },
    { customerPhone: { contains: q, mode: 'insensitive' } },
  ]

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orderItems: true } }
    }
  })

  const statuses = ['Nouvelle', 'Contactée', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Commandes</h1>
          <p>{orders.length} commande(s) trouvée(s)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form method="GET" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <span className="search-icon">
              <SearchIcon size={18} />
            </span>
            <input
              name="q"
              type="text"
              placeholder="Rechercher par numéro, client, téléphone..."
              className="search-input"
              defaultValue={q ?? ''}
            />
          </div>
          <select name="status" className="form-select" style={{ width: 'auto' }} defaultValue={status ?? ''}>
            <option value="">Tous les statuts</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Filtrer</button>
          {(status || q) && (
            <Link href="/admin/commandes" className="btn btn-secondary">Effacer</Link>
          )}
        </form>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {statuses.map(s => (
          <Link
            key={s}
            href={`/admin/commandes?status=${s}`}
            className={`badge ${status === s ? 'badge-primary' : 'badge-gray'}`}
            style={{ cursor: 'pointer', padding: '0.375rem 0.75rem', textDecoration: 'none' }}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <PackageIcon size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3>Aucune commande</h3>
            <p style={{ color: 'var(--gray-500)' }}>Aucune commande ne correspond à vos critères.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Wilaya</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium" style={{ color: 'var(--primary)' }}>{order.orderNumber}</td>
                  <td className="font-medium">{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>{order.wilaya}</td>
                  <td>{order._count.orderItems} article(s)</td>
                  <td className="font-semibold">{order.totalAmount.toLocaleString('fr-DZ')} DA</td>
                  <td>
                    <span className={`badge ${statusColors[order.status] ?? 'badge-gray'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <Link href={`/admin/commandes/${order.id}`} className="btn btn-secondary btn-sm">
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
