'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createProduct, updateProduct, deleteProductImage, setMainImage } from './actions'

interface CategoryOption {
  id: string
  name: string
}

interface ImageItem {
  id: string
  url: string
  isMain: boolean
}

interface ProductInitial {
  id?: string
  name?: string
  slug?: string
  reference?: string | null
  description?: string | null
  price?: number
  oldPrice?: number | null
  stock?: number
  active?: boolean
  categoryId?: string
  images?: ImageItem[]
}

export default function ProductFormClient({
  categories,
  initialData,
}: {
  categories: CategoryOption[]
  initialData?: ProductInitial
}) {
  const isEdit = !!initialData?.id
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [imagesList, setImagesList] = useState<ImageItem[]>(initialData?.images || [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      urls.push(URL.createObjectURL(files[i]))
    }
    setPreviewUrls(urls)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    
    let res: { error?: string } | void
    if (isEdit && initialData?.id) {
      res = await updateProduct(initialData.id, formData)
    } else {
      res = await createProduct(formData)
    }

    setLoading(false)
    if (res && typeof res === 'object' && res.error) {
      setErrorMsg(res.error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!initialData?.id) return
    if (!confirm('Supprimer cette image ?')) return
    const res = await deleteProductImage(imageId, initialData.id)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setImagesList(prev => prev.filter(img => img.id !== imageId))
    }
  }

  const handleSetMain = async (imageId: string) => {
    if (!initialData?.id) return
    const res = await setMainImage(imageId, initialData.id)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setImagesList(prev => prev.map(img => ({ ...img, isMain: img.id === imageId })))
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
          <p>{isEdit ? `Modification de "${initialData.name}"` : 'Ajoutez un produit à votre catalogue'}</p>
        </div>
        <Link href="/admin/produits" className="btn btn-secondary">← Retour</Link>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {categories.length === 0 && (
        <div style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem' }}>⚠️ Aucune catégorie trouvée</strong>
            <span style={{ fontSize: '0.875rem' }}>Pour créer un produit, vous devez d abord créer au moins une catégorie dans le système.</span>
          </div>
          <Link href="/admin/categories/nouvelle" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            + Créer une catégorie maintenant
          </Link>
        </div>
      )}

      <div className="card card-body">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nom du produit *</label>
              <input
                name="name"
                type="text"
                className="form-input"
                defaultValue={initialData?.name || ''}
                placeholder="Ex: Smartphone 5G 256Go"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug URL (optionnel)</label>
              <input
                name="slug"
                type="text"
                className="form-input"
                defaultValue={initialData?.slug || ''}
                placeholder="ex: smartphone-5g (auto si vide)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Référence (SKU)</label>
              <input
                name="reference"
                type="text"
                className="form-input"
                defaultValue={initialData?.reference || ''}
                placeholder="Ex: SMART-5G-256"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Catégorie *</label>
                <Link href="/admin/categories/nouvelle" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                  + Créer une catégorie
                </Link>
              </div>
              <select name="categoryId" className="form-select" defaultValue={initialData?.categoryId || ''} required>
                <option value="">— Sélectionner une catégorie —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Stock disponible *</label>
              <input
                name="stock"
                type="number"
                min="0"
                className="form-input"
                defaultValue={initialData?.stock ?? 0}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prix de vente (DA) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                defaultValue={initialData?.price || ''}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ancien prix / Prix barré (DA)</label>
              <input
                name="oldPrice"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                defaultValue={initialData?.oldPrice || ''}
                placeholder="0.00"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description du produit</label>
              <textarea
                name="description"
                className="form-textarea"
                defaultValue={initialData?.description || ''}
                placeholder="Description détaillée du produit, caractéristiques..."
                rows={4}
              />
            </div>

            {/* Existing images list */}
            {imagesList.length > 0 && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Images actuelles</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  {imagesList.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        border: img.isMain ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                        overflow: 'hidden',
                        background: '#f9fafb'
                      }}
                    >
                      <img src={img.url} alt="Produit" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                      {img.isMain && (
                        <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          Principale
                        </span>
                      )}
                      <div style={{ padding: '0.4rem', display: 'flex', gap: '0.25rem', justifyContent: 'space-between' }}>
                        {!img.isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMain(img.id)}
                            style={{ fontSize: '0.7rem', border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                          >
                            ⭐ Principale
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          style={{ fontSize: '0.7rem', border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: 'auto', padding: 0 }}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{isEdit ? 'Ajouter d autres images' : 'Images du produit'}</label>
              <input
                name="images"
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="form-input"
                onChange={handleFileChange}
                style={{ paddingTop: '0.5rem' }}
              />
              <p className="form-hint">Formats autorisés: JPG, PNG, WEBP, GIF — Max 5 Mo par image.</p>
            </div>

            {/* Live New Image Previews */}
            {previewUrls.length > 0 && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Aperçu des nouvelles images sélectionnées ({previewUrls.length})</label>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                  {previewUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Preview ${idx}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--primary)' }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked={initialData?.active ?? true}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="active" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Produit actif (visible dans le catalogue)</label>
            </div>
          </div>

          <div className="divider" />

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
            </button>
            <Link href="/admin/produits" className="btn btn-secondary">Annuler</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
