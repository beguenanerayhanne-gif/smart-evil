import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductCard from '@/components/ProductCard'
import ProductDetailClient from './ProductDetailClient'
import Link from 'next/link'
import { ChevronRightIcon } from '@/components/Icons'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { name: true, description: true }
  })

  return {
    title: product ? `${product.name} - Smart éveil` : 'Produit non trouvé',
    description: product?.description ?? undefined,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [product, categories, settings] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] },
        variants: {
          include: {
            images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] }
          }
        }
      }
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        children: {
          where: { active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, slug: true, parentId: true }
        }
      }
    }),
    prisma.settings.findMany({ select: { key: true, value: true } })
  ])

  if (!product) notFound()

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, NOT: { id: product.id } },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] }
    }
  })

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  const shopName = settingsMap['shop_name'] ?? 'Smart éveil'
  const contactPhone = settingsMap['contact_phone'] ?? ''
  const contactAddress = settingsMap['contact_address'] ?? ''

  return (
    <>
      <PublicHeader categories={categories} shopName={shopName} whatsappPhone={contactPhone} />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
          <ChevronRightIcon size={14} />
          <Link href="/produits" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Catalogue</Link>
          <ChevronRightIcon size={14} />
          <Link href={`/categorie/${product.category.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{product.category.name}</Link>
          <ChevronRightIcon size={14} />
          <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{product.name}</span>
        </div>

        {/* Product Client View */}
        <ProductDetailClient product={product} whatsappPhone={contactPhone} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.75rem' }}>
              Produits Similaires
            </h2>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </main>

      <WhatsAppButton phone={contactPhone} />
      <PublicFooter shopName={shopName} contactPhone={contactPhone} contactAddress={contactAddress} categories={categories} />
    </>
  )
}
