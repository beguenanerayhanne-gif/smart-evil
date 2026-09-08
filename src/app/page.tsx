import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'
import { ArrowRightIcon, PackageIcon } from '@/components/Icons'

export async function generateMetadata() {
  const settings = await prisma.settings.findMany({ select: { key: true, value: true } })
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  const shopName = settingsMap['shop_name'] ?? 'Smart Evil'
  const heroSubtitle = settingsMap['hero_subtitle'] ?? 'Magasin de jouets en Algérie'

  return {
    title: `${shopName} - Magasin de Jouets | Vente en Ligne & Livraison 58 Wilayas`,
    description: heroSubtitle,
  }
}

export default async function HomePage() {
  const [products, promoProducts, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] },
        variants: { select: { id: true, stock: true } },
      }
    }),
    prisma.product.findMany({
      where: { active: true, NOT: { oldPrice: null } },
      take: 4,
      orderBy: { updatedAt: 'desc' },
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
        },
        _count: { select: { products: { where: { active: true } } } }
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

      {/* Redesigned Hero Section matching Reference Screenshot */}
      <HeroSection categories={categories} />

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        

        {/* Dynamic Promotions Section ("Les Offres du Moment") */}
        {promoProducts.length > 0 && (
          <section style={{ marginBottom: '4.5rem', padding: '2.25rem', backgroundColor: '#fff1f2', borderRadius: '24px', border: '1px solid #fecdd3', boxShadow: '0 10px 30px -10px rgba(225, 29, 72, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span className="badge badge-danger" style={{ marginBottom: '0.5rem' }}>Offres Spéciales</span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#9f1239' }}>
                  Les Offres du Moment
                </h2>
                <p style={{ color: '#be123c', opacity: 0.85, fontSize: '0.9375rem', marginTop: '0.2rem' }}>
                  Profitez de nos réductions exceptionnelles sur une sélection d articles
                </p>
              </div>

              <Link href="/produits" className="btn btn-primary btn-sm">
                <span>Voir toutes les promos</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>

            <div className="product-grid">
              {promoProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Nouveautés & Recent Products Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Catalogue</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                Nouveautés & Derniers Arrivages
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
                Les derniers jouets ajoutés à notre catalogue
              </p>
            </div>

            <Link href="/produits" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
              <span>Voir tout le catalogue</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <PackageIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)' }}>Aucun produit disponible actuellement</h3>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>Revenez très bientôt pour découvrir nos nouveaux jouets !</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </main>

      <WhatsAppButton phone={contactPhone} />
      <PublicFooter shopName={shopName} contactPhone={contactPhone} contactAddress={contactAddress} categories={categories} />
    </>
  )
}
