import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderStatusUpdater from './OrderStatusUpdater'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  'Nouvelle': 'badge-primary',
  'Contactée': 'badge-warning',
  'Confirmée': 'badge-success',
  'En préparation': 'badge-warning',
  'Expédiée': 'badge-primary',
  'Livrée': 'badge-success',
  'Annulée': 'badge-danger',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { product: { select: { id: true, name: true } } }
      }
    }
  })

  if (!order) notFound()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Commande {order.orderNumber}</h1>
          <p>Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${statusColors[order.status] ?? 'badge-gray'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            {order.status}
          </span>
          <Link href="/admin/commandes" className="btn btn-secondary">← Retour</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: order items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Items */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Articles commandés</h2>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Réf.</th>
                    <th>Prix unitaire</th>
                    <th>Quantité</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.productName}</td>
                      <td className="text-muted text-sm">{item.productReference ?? '—'}</td>
                      <td>{item.priceAtTime.toLocaleString('fr-DZ')} DA</td>
                      <td>× {item.quantity}</td>
                      <td className="font-semibold">{item.totalLine.toLocaleString('fr-DZ')} DA</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, padding: '1rem' }}>Total :</td>
                    <td style={{ fontWeight: 700, fontSize: '1.125rem', padding: '1rem', color: 'var(--primary)' }}>
                      {order.totalAmount.toLocaleString('fr-DZ')} DA
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer message */}
          {order.message && (
            <div className="card card-body">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Message du client</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>&ldquo;{order.message}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Right: customer info + status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer info */}
          <div className="card card-body">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Informations client</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <InfoRow label="Nom" value={order.customerName} />
              <InfoRow label="Téléphone" value={order.customerPhone} />
              <InfoRow label="Wilaya" value={order.wilaya} />
              <InfoRow label="Commune" value={order.commune} />
              {order.address && <InfoRow label="Adresse" value={order.address} />}
            </div>
          </div>

          {/* Update status */}
          <div className="card card-body">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Mettre à jour le statut</h2>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 500, minWidth: '80px' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--gray-800)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
