import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

export default async function LegacyProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id, active: true },
    select: { slug: true }
  })

  if (!product) notFound()

  redirect(`/produit/${product.slug}`)
}
