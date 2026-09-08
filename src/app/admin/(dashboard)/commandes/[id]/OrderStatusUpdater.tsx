'use client'

import { useState } from 'react'
import { updateOrderStatus } from '../actions'

const STATUSES = ['Nouvelle', 'Contactée', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée']

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return
    setLoading(true)
    setSaved(false)
    await updateOrderStatus(orderId, status)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="form-select"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="btn btn-primary w-full"
      >
        {loading ? 'Mise à jour...' : saved ? 'Enregistré !' : 'Mettre à jour'}
      </button>
    </div>
  )
}
