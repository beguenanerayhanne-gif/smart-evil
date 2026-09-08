'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'

interface ProductImage {
  id: string
  url: string
  isMain: boolean
}

interface Product {
  id: string
  name: string
  description: string | null
  reference: string | null
  price: number
  stock: number
  images: ProductImage[]
  category: { name: string }
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.images.find(i => i.isMain) ?? product.images[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const router = useRouter()

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        reference: product.reference,
        imageUrl: product.images.find(i => i.isMain)?.url ?? product.images[0]?.url ?? null,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleOrderNow = () => {
    handleAdd()
    router.push('/panier')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
      {/* Images */}
      <div>
        <div style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--gray-100)',
          marginBottom: '1rem',
        }}>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'var(--gray-300)' }}>
              📷
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {product.images.map(img => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: selectedImage?.id === img.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  padding: 0,
                  cursor: 'pointer',
                  background: 'var(--gray-100)',
                }}
              >
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="product-card-category" style={{ marginBottom: '0.5rem' }}>{product.category.name}</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
          {product.name}
        </h1>

        {product.reference && (
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
            Réf. {product.reference}
          </p>
        )}

        <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          {product.price.toLocaleString('fr-DZ')} <span style={{ fontSize: '1.125rem', fontWeight: 400, color: 'var(--gray-500)' }}>DA</span>
        </div>

        {/* Stock */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.875rem' }}>
            {product.stock > 0 ? `✓ En stock (${product.stock} disponible${product.stock > 1 ? 's' : ''})` : '✕ Rupture de stock'}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Description</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Quantity + CTA */}
        {product.stock > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Quantité :</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.5rem 0.875rem', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', background: 'var(--gray-100)', border: 'none', color: 'var(--gray-700)' }}
                >
                  −
                </button>
                <span style={{ padding: '0.5rem 1rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ padding: '0.5rem 0.875rem', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', background: 'var(--gray-100)', border: 'none', color: 'var(--gray-700)' }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleAdd} className="btn btn-outline btn-lg" style={{ flex: 1 }}>
                {added ? '✅ Ajouté !' : '🛒 Ajouter au panier'}
              </button>
              <button onClick={handleOrderNow} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                Commander →
              </button>
            </div>
          </div>
        )}

        {/* Delivery info */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            <div>🚚 Livraison partout en Algérie</div>
            <div>💳 Paiement à la livraison (cash)</div>
            <div>📞 Confirmation par téléphone</div>
          </div>
        </div>
      </div>
    </div>
  )
}
