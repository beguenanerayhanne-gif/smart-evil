import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VariantsManagerClient from './VariantsManagerClient'

export const metadata = {
  title: 'Gestion des Variantes - Administration Smart éveil',
}

export default async function VariantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { createdAt: 'asc' },
        include: {
          images: {
            orderBy: [{ isMain: 'desc' }, { position: 'asc' }],
          },
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <VariantsManagerClient
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        variants: product.variants.map((v) => ({
          id: v.id,
          color: v.color,
          colorHex: v.colorHex,
          reference: v.reference,
          price: v.price,
          oldPrice: v.oldPrice,
          purchasePrice: v.purchasePrice,
          stock: v.stock,
          barcode: v.barcode,
          supplierReference: v.supplierReference,
          images: v.images.map((img) => ({
            id: img.id,
            url: img.url,
            isMain: img.isMain,
            position: img.position,
          })),
        })),
      }}
    />
  )
}
