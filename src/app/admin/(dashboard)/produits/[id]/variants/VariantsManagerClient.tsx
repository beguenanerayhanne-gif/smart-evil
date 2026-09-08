'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  createVariant,
  updateVariant,
  deleteVariant,
  setVariantMainImage,
  deleteVariantImage,
} from '../../variantActions'
import {
  PackageIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowLeftIcon,
  StarIcon,
  UploadIcon,
  EyeIcon,
} from '@/components/Icons'

interface ProductImage {
  id: string
  url: string
  isMain: boolean
  position: number
}

interface ProductVariant {
  id: string
  color: string
  colorHex: string | null
  reference: string | null
  price: number | null
  oldPrice: number | null
  purchasePrice: number | null
  stock: number
  barcode: string | null
  supplierReference: string | null
  images: ProductImage[]
}

interface ProductData {
  id: string
  name: string
  slug: string
  price: number | null
  stock: number | null
  variants: ProductVariant[]
}

export default function VariantsManagerClient({ product }: { product: ProductData }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New variant form state
  const [newColor, setNewColor] = useState('')
  const [newColorHex, setNewColorHex] = useState('')
  const [newRef, setNewRef] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('10')
  const [newFiles, setNewFiles] = useState<FileList | null>(null)

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId('create')
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('color', newColor)
    if (newColorHex) formData.append('colorHex', newColorHex)
    if (newRef) formData.append('reference', newRef)
    if (newPrice) formData.append('price', newPrice)
    formData.append('stock', newStock)

    if (newFiles) {
      Array.from(newFiles).forEach((file) => {
        formData.append('images', file)
      })
    }

    const res = await createVariant(product.id, formData)
    setLoadingId(null)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Variante ajoutée avec succès !')
      setNewColor('')
      setNewColorHex('')
      setNewRef('')
      setNewPrice('')
      setNewStock('10')
      setNewFiles(null)
      setShowCreateModal(false)
    }
  }

  const handleUpdateVariant = async (variantId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingId(variantId)
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateVariant(variantId, formData)
    setLoadingId(null)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Variante mise à jour avec succès !')
    }
  }

  const handleDeleteVariant = async (variantId: string, color: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la variante "${color}" et ses images ?`)) return
    setLoadingId(variantId)
    setErrorMsg(null)
    const res = await deleteVariant(variantId)
    setLoadingId(null)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg(`Variante "${color}" supprimée.`)
    }
  }

  const handleSetMainImage = async (variantId: string, imageId: string) => {
    setLoadingId(`img-${imageId}`)
    const res = await setVariantMainImage(variantId, imageId)
    setLoadingId(null)
    if (res?.error) setErrorMsg(res.error)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Supprimer cette image ?')) return
    setLoadingId(`img-${imageId}`)
    const res = await deleteVariantImage(imageId)
    setLoadingId(null)
    if (res?.error) setErrorMsg(res.error)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/admin/produits" className="btn btn-secondary btn-sm">
              <ArrowLeftIcon size={16} />
              <span>Retour aux produits</span>
            </Link>
            <Link href={`/produit/${product.slug}`} target="_blank" className="btn btn-secondary btn-sm">
              <EyeIcon size={16} />
              <span>Voir la fiche</span>
            </Link>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)' }}>
            Variantes : {product.name}
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Gérez les couleurs, stocks, prix et images spécifiques pour chaque variante.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <PlusIcon size={18} />
          <span>Ajouter une variante</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--mint-light)', color: '#047857', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckIcon size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Variant Card / Form */}
      {showCreateModal && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nouvelle Variante de Couleur</h3>
            <button onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">
              Fermer
            </button>
          </div>

          <form onSubmit={handleCreateVariant}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Nom de la couleur *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: Rose, Bleu Marine, Noir"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Code Couleur HEX (optionnel)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newColorHex || '#000000'}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    style={{ width: '40px', height: '38px', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-300)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="#FF4081"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">SKU / Référence (optionnel)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: TRO-ROSE"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Prix (DA) (optionnel)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder={product.price ? `${product.price} DA (prix parent)` : 'Prix specifique'}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Stock disponible *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Images upload for new variant */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Images de cette couleur (sélection multiple)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-input"
                onChange={(e) => setNewFiles(e.target.files)}
              />
            </div>

            <button type="submit" disabled={loadingId === 'create'} className="btn btn-primary">
              {loadingId === 'create' ? 'Création...' : 'Créer la variante'}
            </button>
          </form>
        </div>
      )}

      {/* Variants List */}
      {product.variants.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <PackageIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
            Aucune variante de couleur pour ce produit
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Ce produit est actuellement géré comme un produit simple sans choix de couleur.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <PlusIcon size={18} />
            <span>Ajouter la première variante</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {product.variants.map((variant) => (
            <div key={variant.id} className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              
              {/* Variant Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {variant.colorHex && (
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: variant.colorHex,
                        border: '1px solid rgba(0,0,0,0.2)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                    Variante : {variant.color}
                  </h3>
                  {variant.reference && (
                    <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>
                      SKU: {variant.reference}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteVariant(variant.id, variant.color)}
                  disabled={loadingId === variant.id}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                >
                  <TrashIcon size={16} />
                  <span>Supprimer cette variante</span>
                </button>
              </div>

              {/* Form to edit variant attributes */}
              <form onSubmit={(e) => handleUpdateVariant(variant.id, e)}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">Couleur</label>
                    <input
                      type="text"
                      name="color"
                      className="form-input"
                      defaultValue={variant.color}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Code Hex (#)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        defaultValue={variant.colorHex || '#000000'}
                        onChange={(e) => {
                          const form = e.currentTarget.form
                          if (form) {
                            const hexInput = form.querySelector('input[name="colorHex"]') as HTMLInputElement
                            if (hexInput) hexInput.value = e.target.value
                          }
                        }}
                        style={{ width: '38px', height: '38px', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-300)', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        name="colorHex"
                        className="form-input"
                        defaultValue={variant.colorHex ?? ''}
                        placeholder="#FF4081"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">SKU / Référence</label>
                    <input
                      type="text"
                      name="reference"
                      className="form-input"
                      defaultValue={variant.reference ?? ''}
                    />
                  </div>

                  <div>
                    <label className="form-label">Prix (DA)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      className="form-input"
                      defaultValue={variant.price ?? ''}
                      placeholder={product.price ? `${product.price} DA` : 'Prix'}
                    />
                  </div>

                  <div>
                    <label className="form-label">Stock disponible</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-input"
                      defaultValue={variant.stock}
                      required
                    />
                  </div>
                </div>

                {/* Upload additional images */}
                <div style={{ marginBottom: '1.25rem', backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                  <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UploadIcon size={16} />
                    <span>Ajouter des photos à la variante "{variant.color}"</span>
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="form-input"
                    style={{ background: 'white' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', display: 'block' }}>
                    Les images téléversées ici seront associées UNIQUEMENT à la variante {variant.color}.
                  </span>
                </div>

                {/* Images gallery for this variant */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.75rem' }}>
                    Galerie photo de la variante {variant.color} ({variant.images.length})
                  </h4>

                  {variant.images.length === 0 ? (
                    <div style={{ padding: '1.25rem', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                      Aucune image assignée à la variante {variant.color}.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.85rem' }}>
                      {variant.images.map((img) => (
                        <div
                          key={img.id}
                          style={{
                            position: 'relative',
                            borderRadius: 'var(--radius)',
                            border: img.isMain ? '2.5px solid var(--primary)' : '1px solid var(--gray-200)',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                          }}
                        >
                          <div style={{ position: 'relative', paddingTop: '100%' }}>
                            <img
                              src={img.url}
                              alt=""
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          {/* Image Actions Overlay / Footer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)' }}>
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(variant.id, img.id)}
                              disabled={loadingId === `img-${img.id}`}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: img.isMain ? '#eab308' : 'var(--gray-400)',
                                padding: '2px',
                              }}
                              title={img.isMain ? 'Image principale de cette couleur' : 'Définir comme principale'}
                            >
                              <StarIcon size={16} fill={img.isMain ? '#eab308' : 'none'} />
                            </button>

                            {img.isMain && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                Principale
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              disabled={loadingId === `img-${img.id}`}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'var(--danger)',
                                padding: '2px',
                              }}
                              title="Supprimer l'image"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loadingId === variant.id}
                    className="btn btn-primary"
                  >
                    {loadingId === variant.id ? 'Enregistrement...' : 'Enregistrer la variante'}
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
