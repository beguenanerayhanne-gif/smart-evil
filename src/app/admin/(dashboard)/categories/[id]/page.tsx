import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateCategory } from '../actions'
import Link from 'next/link'

export const metadata = {
  title: 'Modifier la catégorie - Administration',
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [category, parentCategories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { active: true, parentId: null, NOT: { id } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ])

  if (!category) notFound()

  const updateWithId = updateCategory.bind(null, id)

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <div>
          <h1>Modifier la catégorie</h1>
          <p>&ldquo;{category.name}&rdquo;</p>
        </div>
        <Link href="/admin/categories" className="btn btn-secondary">← Retour</Link>
      </div>

      <div className="card card-body">
        <form action={updateWithId}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nom de la catégorie *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              defaultValue={category.name}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slug">Slug URL</label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="form-input"
              defaultValue={category.slug}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="parentId">Catégorie parente</label>
            <select id="parentId" name="parentId" className="form-select" defaultValue={category.parentId ?? ''}>
              <option value="">— Aucune (catégorie principale) —</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked={category.active}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="active" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Catégorie active</label>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">Enregistrer</button>
            <Link href="/admin/categories" className="btn btn-secondary">Annuler</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
