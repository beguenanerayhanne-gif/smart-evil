import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductCard from '@/components/ProductCard'
import CategoryIcon from '@/components/CategoryIcon'
import Link from 'next/link'
import { ChevronRightIcon, TagIcon, PackageIcon } from '@/components/Icons'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findFirst({
    where: { slug, active: true },
    select: { name: true }
  })

  return {
    title: category ? `${category.name} - Jouets & Produits | Smart éveil` : 'Catégorie non trouvée',
    description: category ? `Acheter des jouets de la catégorie ${category.name} avec livraison partout en Algérie.` : undefined,
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const targetCategory = await prisma.category.findFirst({
    where: { slug, active: true },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { active: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, slug: true, icon: true }
      }
    }
  })

  if (!targetCategory) notFound()

  // Collect category IDs (target category + subcategories)
  const subCategoryIds = targetCategory.children.map(c => c.id)
  const categoryIds = [targetCategory.id, ...subCategoryIds]

  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        categoryId: { in: categoryIds },
      },
      orderBy: { createdAt: 'desc' },
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
          <Link href="/categories" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Catégories</Link>
          {targetCategory.parent && (
            <>
              <ChevronRightIcon size={14} />
              <Link href={`/categorie/${targetCategory.parent.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{targetCategory.parent.name}</Link>
            </>
          )}
          <ChevronRightIcon size={14} />
          <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{targetCategory.name}</span>
        </div>

        {/* Category Header Card */}
        <div style={{ marginBottom: '2.5rem', padding: '2rem', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CategoryIcon slug={targetCategory.slug} icon={targetCategory.icon} size={22} />
            </div>
            <span className="badge badge-primary">Univers de jouets</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {targetCategory.name}
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
            {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''} dans cette catégorie
          </p>

          {/* Subcategories Filter Chips */}
          {targetCategory.children.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Sous-catégories :
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  }}
                >
                  Tous les produits ({products.length})
                </span>
                {targetCategory.children.map(sub => (
                  <Link
                    key={sub.id}
                    href={`/categorie/${sub.slug}`}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: 'var(--gray-100)',
                      color: 'var(--gray-800)',
                      transition: 'var(--transition-fast)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <CategoryIcon slug={sub.slug} icon={sub.icon} size={15} />
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <PackageIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
              Aucun produit dans cette catégorie pour le moment
            </h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>De nouveaux jouets seront bientôt disponibles !</p>
            <Link href="/produits" className="btn btn-primary">Voir tout le catalogue</Link>
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
