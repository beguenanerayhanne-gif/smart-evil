'use server'

import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData): Promise<{ error?: string } | void> {
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const priceRaw = formData.get('price') as string
  const oldPriceRaw = formData.get('oldPrice') as string
  const stockRaw = formData.get('stock') as string
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'
  const categoryId = formData.get('categoryId') as string

  if (!name) return { error: 'Le nom du produit est obligatoire.' }
  if (!categoryId) return { error: 'Veuillez sélectionner une catégorie.' }

  const price = parseFloat(priceRaw)
  if (isNaN(price) || price < 0) return { error: 'Le prix doit être un nombre supérieur ou égal à 0.' }

  const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null
  if (oldPrice !== null && (isNaN(oldPrice) || oldPrice < 0)) {
    return { error: 'L ancien prix doit être un nombre valide.' }
  }

  const stock = stockRaw ? parseInt(stockRaw, 10) : 0
  if (isNaN(stock) || stock < 0) return { error: 'Le stock doit être un nombre entier positif ou zéro.' }

  // Check category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) return { error: 'La catégorie sélectionnée n existe pas.' }

  let slug = customSlug ? slugify(customSlug) : slugify(name)
  if (!slug) slug = `prod-${Date.now()}`

  // Ensure unique slug
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      reference,
      price,
      oldPrice,
      stock,
      active,
      categoryId,
    }
  })

  // Process uploaded images
  const files = formData.getAll('images') as File[]
  let isFirst = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file && file.size > 0) {
      const res = await saveUploadedFile(file)
      if (res.success && res.url) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: res.url,
            isMain: isFirst,
            position: i,
          }
        })
        isFirst = false
      }
    }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/')
  redirect('/admin/produits')
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const priceRaw = formData.get('price') as string
  const oldPriceRaw = formData.get('oldPrice') as string
  const stockRaw = formData.get('stock') as string
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'
  const categoryId = formData.get('categoryId') as string

  if (!name) return { error: 'Le nom du produit est obligatoire.' }
  if (!categoryId) return { error: 'Veuillez sélectionner une catégorie.' }

  const price = parseFloat(priceRaw)
  if (isNaN(price) || price < 0) return { error: 'Le prix doit être un nombre supérieur ou égal à 0.' }

  const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null
  if (oldPrice !== null && (isNaN(oldPrice) || oldPrice < 0)) {
    return { error: 'L ancien prix doit être un nombre valide.' }
  }

  const stock = stockRaw ? parseInt(stockRaw, 10) : 0
  if (isNaN(stock) || stock < 0) return { error: 'Le stock doit être un nombre entier positif ou zéro.' }

  let slug = customSlug ? slugify(customSlug) : slugify(name)
  if (!slug) slug = `prod-${Date.now()}`

  const existingSlug = await prisma.product.findFirst({
    where: { slug, NOT: { id } }
  })
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      reference,
      price,
      oldPrice,
      stock,
      active,
      categoryId,
    }
  })

  // Upload new images if attached
  const files = formData.getAll('images') as File[]
  const existingImagesCount = await prisma.productImage.count({ where: { productId: id } })

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file && file.size > 0) {
      const res = await saveUploadedFile(file)
      if (res.success && res.url) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: res.url,
            isMain: existingImagesCount === 0 && i === 0,
            position: existingImagesCount + i,
          }
        })
      }
    }
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}`)
  revalidatePath('/')
  redirect('/admin/produits')
}

export async function toggleProductStatus(id: string): Promise<{ success: boolean; error?: string }> {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return { success: false, error: 'Produit introuvable.' }

  await prisma.product.update({
    where: { id },
    data: { active: !product.active }
  })

  revalidatePath('/admin/produits')
  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const images = await prisma.productImage.findMany({ where: { productId: id } })
  for (const img of images) {
    await deleteUploadedFile(img.url)
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/produits')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<{ success: boolean; error?: string }> {
  const img = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!img) return { success: false, error: 'Image introuvable.' }

  await deleteUploadedFile(img.url)

  if (img.isMain) {
    const nextImage = await prisma.productImage.findFirst({
      where: { productId, NOT: { id: imageId } }
    })
    if (nextImage) {
      await prisma.productImage.update({
        where: { id: nextImage.id },
        data: { isMain: true }
      })
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } })
  revalidatePath(`/admin/produits/${productId}`)
  revalidatePath('/')
  return { success: true }
}

export async function setMainImage(imageId: string, productId: string): Promise<{ success: boolean; error?: string }> {
  await prisma.productImage.updateMany({
    where: { productId },
    data: { isMain: false }
  })

  await prisma.productImage.update({
    where: { id: imageId },
    data: { isMain: true }
  })

  revalidatePath(`/admin/produits/${productId}`)
  revalidatePath('/')
  return { success: true }
}
