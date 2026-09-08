'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toggleProductStatus, deleteProduct } from './actions'
import { PackageIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/Icons'

interface ProductVariantItem {
  id: string
  color: string
  reference: string | null
  price: number | null
  stock: number
}

interface ProductItem {
  id: string
  name: string
  slug: string
  reference: string | null
  price: number | null
  oldPrice: number | null
  stock: number | null
  active: boolean
  category: { name: string }
  images: { url: string }[]
  variants?: ProductVariantItem[]
}

export default function ProductListClient({ products }: { products: ProductItem[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    setLoadingId(id)
    setErrorMsg(null)
    const res = await toggleProductStatus(id)
    setLoadingId(null)
    if (res?.error) setErrorMsg(res.error)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le produit "${name}" ?`)) return
    setLoadingId(id)
    setErrorMsg(null)
    const res = await deleteProduct(id)
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
                <th>Image</th>
                <th>Produit</th>
                <th>Référence</th>
                <th>Catégorie</th>
                <th>Couleur / Var</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const variants = product.variants || []
                const hasVariants = variants.length > 0
                const displayPrice = hasVariants ? (variants[0].price ?? product.price ?? 0) : (product.price ?? 0)
                const totalStock = hasVariants ? variants.reduce((acc, v) => acc + (v.stock || 0), 0) : (product.stock ?? 0)

                return (
                  <tr key={product.id}>
                    <td>
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                          <PackageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>/{product.slug}</div>
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{product.reference ?? '—'}</td>
                    <td>
                      <span className="badge badge-gray">{product.category.name}</span>
                    </td>
                    <td>
                      {hasVariants ? (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {variants.slice(0, 3).map((v) => (
                            <span key={v.id} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                              {v.color}
                            </span>
                          ))}
                          {variants.length > 3 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                              +{variants.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Produit simple</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {displayPrice.toLocaleString('fr-DZ')} DA
                      </div>
                      {product.oldPrice && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                          {product.oldPrice.toLocaleString('fr-DZ')} DA
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${totalStock > 5 ? 'badge-success' : totalStock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {totalStock} en stock
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(product.id)}
                        disabled={loadingId === product.id}
                        className={`badge ${product.active ? 'badge-success' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Cliquer pour changer de statut"
                      >
                        {product.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <Link href={`/admin/produits/${product.id}/variants`} className="btn btn-outline btn-sm" title="Gérer les variantes">
                          Gérer les variantes
                        </Link>
                        <Link href={`/produit/${product.slug}`} target="_blank" className="btn btn-secondary btn-sm" title="Voir sur le site">
                          <EyeIcon size={14} />
                        </Link>
                        <Link href={`/admin/produits/${product.id}`} className="btn btn-secondary btn-sm" title="Modifier le produit">
                          <EditIcon size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={loadingId === product.id}
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
