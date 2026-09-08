import { prisma } from '@/lib/prisma'
import { createCategory } from '../actions'
import Link from 'next/link'

export const metadata = {
  title: 'Nouvelle catégorie - Administration',
}

export default async function NewCategoryPage() {
  const parentCategories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <div>
          <h1>Nouvelle catégorie</h1>
          <p>Créez une nouvelle catégorie pour organiser vos produits</p>
        </div>
        <Link href="/admin/categories" className="btn btn-secondary">← Retour</Link>
      </div>

      <div className="card card-body">
        <form action={createCategory}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nom de la catégorie *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Ex: Électronique, Vêtements..."
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slug">Slug URL (optionnel)</label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="form-input"
              placeholder="Ex: electronique (généré automatiquement si vide)"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="parentId">Catégorie parente (optionnel)</label>
            <select id="parentId" name="parentId" className="form-select">
              <option value="">— Aucune (catégorie principale) —</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input id="active" name="active" type="checkbox" defaultChecked style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="active" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Catégorie active (visible sur le site)</label>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              Créer la catégorie
            </button>
            <Link href="/admin/categories" className="btn btn-secondary">Annuler</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
