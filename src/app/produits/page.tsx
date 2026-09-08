import { prisma } from '@/lib/prisma'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductCard from '@/components/ProductCard'
import CatalogFilters from '@/components/CatalogFilters'
import Link from 'next/link'
import { ChevronRightIcon, PackageIcon } from '@/components/Icons'

export const metadata = {
  title: 'Catalogue des Jouets & Produits | Smart éveil',
  description: 'Découvrez l ensemble de notre catalogue de jouets pour enfants. Livraison dans toutes les wilayas d Algérie.',
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; age?: string }>
}) {
  const { q, category, sort, age } = await searchParams

  const where: Record<string, unknown> = { active: true }

  // If a category slug is specified, resolve it and include its subcategories if any
  let selectedCategoryObj = null
  if (category) {
    selectedCategoryObj = await prisma.category.findFirst({
      where: { slug: category, active: true },
      include: { children: { select: { id: true } } }
    })

    if (selectedCategoryObj) {
      const catIds = [selectedCategoryObj.id, ...selectedCategoryObj.children.map(c => c.id)]
      where.categoryId = { in: catIds }
    }
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { reference: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (age) {
    if (age === '0-3') {
      where.ageMin = { lte: 3 }
    } else if (age === '3-6') {
      where.OR = [{ ageMin: { gte: 3, lte: 6 } }, { ageMax: { gte: 3, lte: 6 } }]
    } else if (age === '6-9') {
      where.OR = [{ ageMin: { gte: 6, lte: 9 } }, { ageMax: { gte: 6, lte: 9 } }]
    } else if (age === '9-12') {
      where.OR = [{ ageMin: { gte: 9 } }]
    }
  }

  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' }
  } else if (sort === 'name-asc') {
    orderBy = { name: 'asc' }
  }

  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] },
        variants: { select: { id: true, stock: true } },
      }
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        order: true,
        parentId: true,
        children: {
          where: { active: true },
          orderBy: { order: 'asc' },
          select: { id: true, name: true, slug: true, icon: true, order: true, parentId: true }
        }
      }
    }),
    prisma.settings.findMany({ select: { key: true, value: true } })
  ])

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  const shopName = settingsMap['shop_name'] ?? 'Smart éveil'
  const contactPhone = settingsMap['contact_phone'] ?? ''
  const contactAddress = settingsMap['contact_address'] ?? ''

  return (
    <>
      <PublicHeader categories={categories} shopName={shopName} whatsappPhone={contactPhone} />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
          <ChevronRightIcon size={14} />
          <span>Catalogue</span>
          {selectedCategoryObj && (
            <>
              <ChevronRightIcon size={14} />
              <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{selectedCategoryObj.name}</span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>Magasin de Jouets</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            {selectedCategoryObj ? selectedCategoryObj.name : q ? `Résultats pour "${q}"` : 'Tous les Jouets'}
          </h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Client Interactive Filters Toolbar */}
        <CatalogFilters
          categories={categories}
          selectedCategorySlug={category ?? ''}
          initialQuery={q ?? ''}
          initialSort={sort ?? 'newest'}
        />

        {/* Products Grid / Empty State */}
        {products.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <PackageIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Aucun produit ne correspond à votre recherche
            </h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              Essayez de rechercher un autre mot-clé ou réinitialisez les filtres.
            </p>
            <Link href="/produits" className="btn btn-primary">Réinitialiser le catalogue</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </main>

      <WhatsAppButton phone={contactPhone} />
      <PublicFooter shopName={shopName} contactPhone={contactPhone} contactAddress={contactAddress} categories={categories} />
    </>
  )
}
