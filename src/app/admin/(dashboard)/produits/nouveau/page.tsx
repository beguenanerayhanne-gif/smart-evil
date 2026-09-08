import { prisma } from '@/lib/prisma'
import ProductFormClient from '../ProductFormClient'

export const metadata = {
  title: 'Nouveau produit - Administration',
}

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return <ProductFormClient categories={categories} />
}
