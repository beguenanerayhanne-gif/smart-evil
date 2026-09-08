import { prisma } from '@/lib/prisma'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import CategoryCard from '@/components/CategoryCard'
import Link from 'next/link'
import { ChevronRightIcon, TagIcon } from '@/components/Icons'

export const metadata = {
  title: 'Explorez nos Catégories | Smart éveil',
  description: 'Parcourez l ensemble des univers de jouets et catégories de notre boutique en ligne.',
}

export default async function CategoriesListPage() {
  const [categories, settings] = await Promise.all([
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

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
          <ChevronRightIcon size={14} />
          <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>Catégories</span>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Univers de jeu</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Explorez nos Catégories
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '1rem', lineHeight: '1.6' }}>
            Choisissez une catégorie pour découvrir tous les jouets et produits associés.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <TagIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Aucune catégorie disponible actuellement</h3>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>Revenez très bientôt !</p>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </main>

      <WhatsAppButton phone={contactPhone} />
      <PublicFooter shopName={shopName} contactPhone={contactPhone} contactAddress={contactAddress} categories={categories} />
    </>
  )
}
