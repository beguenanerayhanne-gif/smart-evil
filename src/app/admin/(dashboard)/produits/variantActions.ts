'use server'

import { prisma } from '@/lib/prisma'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'
import { revalidatePath } from 'next/cache'

export async function createVariant(productId: string, formData: FormData): Promise<{ error?: string; success?: boolean; variantId?: string }> {
  const color = (formData.get('color') as string)?.trim()
  const colorHex = (formData.get('colorHex') as string)?.trim() || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const priceRaw = formData.get('price') as string
  const oldPriceRaw = formData.get('oldPrice') as string
  const purchasePriceRaw = formData.get('purchasePrice') as string
  const stockRaw = formData.get('stock') as string
  const barcode = (formData.get('barcode') as string)?.trim() || null
  const supplierReference = (formData.get('supplierReference') as string)?.trim() || null

  if (!color) return { error: 'La couleur est obligatoire.' }

  const price = priceRaw ? parseFloat(priceRaw) : null
  const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null
  const purchasePrice = purchasePriceRaw ? parseFloat(purchasePriceRaw) : null
  const stock = stockRaw ? parseInt(stockRaw, 10) : 0

  if (isNaN(stock) || stock < 0) return { error: 'Le stock doit être un nombre valide.' }

  // Ensure unique reference if provided
  if (reference) {
    const existing = await prisma.productVariant.findUnique({ where: { reference } })
    if (existing) {
      return { error: `Le SKU/Référence "${reference}" est déjà utilisé par une autre variante.` }
    }
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      color,
      colorHex,
      reference,
      price,
      oldPrice,
      purchasePrice,
      stock,
      barcode,
      supplierReference,
    },
  })

  // Upload files if attached
  const files = formData.getAll('images') as File[]
  let isFirst = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file && file.size > 0) {
      const res = await saveUploadedFile(file)
      if (res.success && res.url) {
        await prisma.productImage.create({
          data: {
            productId,
            variantId: variant.id,
            url: res.url,
            isMain: isFirst,
            position: i,
          },
        })
        isFirst = false
      }
    }
  }

  revalidatePath(`/admin/produits/${productId}/variants`)
  revalidatePath(`/admin/produits`)
  revalidatePath(`/produit`)
  return { success: true, variantId: variant.id }
}

export async function updateVariant(variantId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
  if (!variant) return { error: 'Variante introuvable.' }

  const color = (formData.get('color') as string)?.trim()
  const colorHex = (formData.get('colorHex') as string)?.trim() || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const priceRaw = formData.get('price') as string
  const oldPriceRaw = formData.get('oldPrice') as string
  const purchasePriceRaw = formData.get('purchasePrice') as string
  const stockRaw = formData.get('stock') as string
  const barcode = (formData.get('barcode') as string)?.trim() || null
  const supplierReference = (formData.get('supplierReference') as string)?.trim() || null

  if (!color) return { error: 'La couleur est obligatoire.' }

  const price = priceRaw ? parseFloat(priceRaw) : null
  const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null
  const purchasePrice = purchasePriceRaw ? parseFloat(purchasePriceRaw) : null
  const stock = stockRaw ? parseInt(stockRaw, 10) : 0

  if (reference && reference !== variant.reference) {
    const existing = await prisma.productVariant.findUnique({ where: { reference } })
    if (existing) {
      return { error: `Le SKU/Référence "${reference}" est déjà utilisé.` }
    }
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      color,
      colorHex,
      reference,
      price,
      oldPrice,
      purchasePrice,
      stock,
      barcode,
      supplierReference,
    },
  })

  // Process any uploaded images
  const files = formData.getAll('images') as File[]
  const existingCount = await prisma.productImage.count({ where: { variantId } })

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file && file.size > 0) {
      const res = await saveUploadedFile(file)
      if (res.success && res.url) {
        await prisma.productImage.create({
          data: {
            productId: variant.productId,
            variantId: variant.id,
            url: res.url,
            isMain: existingCount === 0 && i === 0,
            position: existingCount + i,
          },
        })
      }
    }
  }

  revalidatePath(`/admin/produits/${variant.productId}/variants`)
  revalidatePath(`/admin/produits`)
  revalidatePath(`/produit`)
  return { success: true }
}

export async function deleteVariant(variantId: string): Promise<{ error?: string; success?: boolean }> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { images: true },
  })
  if (!variant) return { error: 'Variante introuvable.' }

  // Delete images from disk
  for (const img of variant.images) {
    if (img.url) await deleteUploadedFile(img.url)
  }

  await prisma.productVariant.delete({ where: { id: variantId } })

  revalidatePath(`/admin/produits/${variant.productId}/variants`)
  revalidatePath(`/admin/produits`)
  revalidatePath(`/produit`)
  return { success: true }
}

export async function setVariantMainImage(variantId: string, imageId: string): Promise<{ error?: string; success?: boolean }> {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image || image.variantId !== variantId) return { error: 'Image introuvable pour cette variante.' }

  // Set all images of variant to isMain: false
  await prisma.productImage.updateMany({
    where: { variantId },
    data: { isMain: false },
  })

  // Set selected image as main
  await prisma.productImage.update({
    where: { id: imageId },
    data: { isMain: true },
  })

  revalidatePath(`/admin/produits/${image.productId}/variants`)
  return { success: true }
}

export async function deleteVariantImage(imageId: string): Promise<{ error?: string; success?: boolean }> {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image) return { error: 'Image introuvable.' }

  if (image.url) {
    await deleteUploadedFile(image.url)
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  // If deleted image was main, set the first remaining image as main
  if (image.variantId && image.isMain) {
    const nextImg = await prisma.productImage.findFirst({
      where: { variantId: image.variantId },
      orderBy: { position: 'asc' },
    })
    if (nextImg) {
      await prisma.productImage.update({
        where: { id: nextImg.id },
        data: { isMain: true },
      })
    }
  }

  revalidatePath(`/admin/produits/${image.productId}/variants`)
  return { success: true }
}
