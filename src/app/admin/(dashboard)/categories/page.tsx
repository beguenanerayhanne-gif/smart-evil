import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CategoryListClient from './CategoryListClient'
import { PlusIcon, TagIcon } from '@/components/Icons'

export const metadata = {
  title: 'Catégories - Administration Smart éveil',
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } }
    }
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)' }}>Gestion des Catégories</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.15rem' }}>{categories.length} catégorie(s) enregistrée(s) dans la base de données</p>
        </div>
        <Link href="/admin/categories/nouvelle" className="btn btn-primary">
          <PlusIcon size={18} />
          <span>Nouvelle catégorie</span>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <TagIcon size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>Aucune catégorie</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Créez votre première catégorie pour organiser le catalogue Smart éveil.</p>
            <Link href="/admin/categories/nouvelle" className="btn btn-primary">
              <PlusIcon size={18} />
              <span>Créer une catégorie</span>
            </Link>
          </div>
        </div>
      ) : (
        <CategoryListClient categories={categories} />
      )}
    </div>
  )
}
