import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductListClient from './ProductListClient'
import { SearchIcon, PackageIcon, PlusIcon, FileSpreadsheetIcon } from '@/components/Icons'

export const metadata = {
  title: 'Produits - Administration Smart éveil',
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; categoryId?: string }> }) {
  const params = await searchParams
  const { q, categoryId } = params

  const where: Record<string, unknown> = {}
  if (categoryId) where.categoryId = categoryId
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { reference: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] },
        variants: { include: { images: true } },
      }
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ])

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)' }}>Gestion des Produits</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.15rem' }}>{products.length} produit(s) trouvé(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/admin/produits/importer" className="btn btn-secondary">
            <FileSpreadsheetIcon size={18} />
            <span>Importer CSV</span>
          </Link>
          <Link href="/admin/produits/nouveau" className="btn btn-primary">
            <PlusIcon size={18} />
            <span>Nouveau produit</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form method="GET" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '220px' }}>
            <span className="search-icon">
              <SearchIcon size={18} />
            </span>
            <input
              name="q"
              type="text"
              placeholder="Rechercher par nom ou référence SKU..."
              className="search-input"
              defaultValue={q ?? ''}
            />
          </div>
          <select name="categoryId" className="form-select" style={{ width: 'auto' }} defaultValue={categoryId ?? ''}>
            <option value="">Toutes les catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Filtrer</button>
          {(q || categoryId) && (
            <Link href="/admin/produits" className="btn btn-secondary">Effacer</Link>
          )}
        </form>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <PackageIcon size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>Aucun produit trouvé</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Commencez par créer votre premier produit au catalogue.</p>
            <Link href="/admin/produits/nouveau" className="btn btn-primary">
              <PlusIcon size={18} />
              <span>Créer un produit</span>
            </Link>
          </div>
        </div>
      ) : (
        <ProductListClient products={products} />
      )}
    </div>
  )
}
