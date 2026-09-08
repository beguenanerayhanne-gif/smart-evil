import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CsvImportClient from './CsvImportClient'
import { ChevronRightIcon, PackageIcon } from '@/components/Icons'

export const metadata = {
  title: 'Importer des produits CSV - Administration Smart éveil',
}

export default async function CsvImportPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, parentId: true }
  })

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
          <Link href="/admin/produits" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Produits</Link>
          <ChevronRightIcon size={14} />
          <span>Importation CSV / Grille</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)' }}>
          Grille d'Importation Rapide
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
          Mettez à jour ou ajoutez des produits en masse via la grille interactive.
        </p>
      </div>

      <CsvImportClient categories={categories} />
    </div>
  )
}
