'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toggleCategoryStatus, deleteCategory } from './actions'
import { TagIcon, EditIcon, TrashIcon, ChevronRightIcon } from '@/components/Icons'

interface CategoryItem {
  id: string
  name: string
  slug: string
  active: boolean
  createdAt: Date
  parentId: string | null
  parent: { name: string } | null
  _count: { products: number; children: number }
}

export default function CategoryListClient({ categories }: { categories: CategoryItem[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    setLoadingId(id)
    setErrorMsg(null)
    const res = await toggleCategoryStatus(id)
    setLoadingId(null)
    if (res?.error) setErrorMsg(res.error)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) return
    setLoadingId(id)
    setErrorMsg(null)
    const res = await deleteCategory(id)
    setLoadingId(null)
    if (res?.error) setErrorMsg(res.error)
  }

  return (
    <div>
      {errorMsg && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nom de la catégorie</th>
                <th>Slug</th>
                <th>Hiérarchie</th>
                <th>Produits</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isSub = !!cat.parentId

                return (
                  <tr key={cat.id} style={{ backgroundColor: isSub ? 'var(--gray-50)' : 'var(--white)' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: isSub ? '1.5rem' : '0' }}>
                        {isSub && <ChevronRightIcon size={14} className="text-muted" style={{ flexShrink: 0 }} />}
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isSub ? 'var(--gray-200)' : 'var(--primary-light)',
                            color: isSub ? 'var(--gray-600)' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <TagIcon size={14} />
                        </div>
                        <span style={{ fontWeight: isSub ? 600 : 800, color: 'var(--gray-900)', fontSize: isSub ? '0.875rem' : '0.925rem' }}>
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                      /{cat.slug}
                    </td>
                    <td>
                      {cat.parent ? (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="badge badge-primary" style={{ fontSize: '0.725rem' }}>
                          Principale
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                        {cat._count.products} produit(s)
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(cat.id)}
                        disabled={loadingId === cat.id}
                        className={`badge ${cat.active ? 'badge-success' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Cliquer pour changer le statut"
                      >
                        {cat.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <Link href={`/admin/categories/${cat.id}`} className="btn btn-secondary btn-sm">
                          <EditIcon size={14} />
                          <span>Modifier</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={loadingId === cat.id}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
