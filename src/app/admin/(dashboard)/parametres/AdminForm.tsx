'use client'

import { useState } from 'react'
import { UserIcon } from '@/components/Icons'
import { createAdminAction, deleteAdminAction } from './actions'

interface AdminUser {
  id: string
  username: string
  createdAt: Date
}

export default function AdminForm({ admins }: { admins: AdminUser[] }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const res = await createAdminAction(formData)
    setLoading(false)

    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: `Administrateur "${username}" créé avec succès !` })
      setUsername('')
      setPassword('')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer l administrateur "${name}" ?`)) return
    const res = await deleteAdminAction(id)
    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <div className="card card-body mt-4">
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Gestion des Administrateurs ({admins.length})
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Vous pouvez créer plusieurs comptes administrateurs pour gérer le magasin.
      </p>

      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: message.type === 'error' ? '#991b1b' : '#166534',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Admin creation form */}
      <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr auto', alignItems: 'end', marginBottom: '1.5rem' }}>
        <div>
          <label className="form-label">Identifiant (Username)</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: admin2"
            required
          />
        </div>
        <div>
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Création...' : 'Ajouter Admin'}
        </button>
      </form>

      {/* Admin list table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>
              <th style={{ padding: '0.5rem 0' }}>Identifiant</th>
              <th style={{ padding: '0.5rem 0' }}>Date de création</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => (
              <tr key={adm.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserIcon size={16} style={{ color: 'var(--gray-500)' }} />
                  {adm.username}
                </td>
                <td style={{ padding: '0.75rem 0', color: 'var(--gray-500)' }}>
                  {new Date(adm.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  {admins.length > 1 ? (
                    <button
                      onClick={() => handleDelete(adm.id, adm.username)}
                      className="btn btn-ghost"
                      style={{ color: '#dc2626', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Supprimer
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Compte principal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
