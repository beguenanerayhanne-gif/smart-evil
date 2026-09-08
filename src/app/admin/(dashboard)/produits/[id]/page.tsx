import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductFormClient from '../ProductFormClient'

export const metadata = {
  title: 'Modifier le produit - Administration',
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] } }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ])

  if (!product) notFound()

  return (
    <ProductFormClient
      categories={categories}
      initialData={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        reference: product.reference,
        description: product.description,
        price: product.price ?? undefined,
        oldPrice: product.oldPrice ?? undefined,
        stock: product.stock ?? undefined,
        active: product.active,
        categoryId: product.categoryId,
        images: product.images.map(img => ({
          id: img.id,
          url: img.url,
          isMain: img.isMain,
        })),
      }}
    />
  )
}
