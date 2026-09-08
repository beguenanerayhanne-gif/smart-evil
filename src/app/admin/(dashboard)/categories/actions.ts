'use server'

import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const icon = (formData.get('icon') as string)?.trim() || null
  const orderRaw = formData.get('order') as string
  const order = orderRaw ? parseInt(orderRaw, 10) : 0
  const parentId = (formData.get('parentId') as string) || null
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'

  if (!name) {
    throw new Error('Le nom de la catégorie est obligatoire.')
  }

  let slug = customSlug ? slugify(customSlug) : slugify(name)
  if (!slug) slug = `cat-${Date.now()}`

  // Check unique slug
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      icon,
      order: isNaN(order) ? 0 : order,
      parentId: parentId && parentId !== 'none' ? parentId : null,
      active,
    }
  })

  revalidatePath('/admin/categories')
  revalidatePath('/categories')
  revalidatePath('/')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const icon = (formData.get('icon') as string)?.trim() || null
  const orderRaw = formData.get('order') as string
  const order = orderRaw ? parseInt(orderRaw, 10) : 0
  const parentId = (formData.get('parentId') as string) || null
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'

  if (!name) {
    throw new Error('Le nom de la catégorie est obligatoire.')
  }

  let slug = customSlug ? slugify(customSlug) : slugify(name)
  if (!slug) slug = `cat-${Date.now()}`

  const existing = await prisma.category.findFirst({
    where: { slug, NOT: { id } }
  })
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      icon,
      order: isNaN(order) ? 0 : order,
      parentId: parentId && parentId !== 'none' ? parentId : null,
      active,
    }
  })

  revalidatePath('/admin/categories')
  revalidatePath('/categories')
  revalidatePath('/')
  redirect('/admin/categories')
}

export async function toggleCategoryStatus(id: string): Promise<{ success: boolean; error?: string }> {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return { success: false, error: 'Catégorie introuvable.' }

  await prisma.category.update({
    where: { id },
    data: { active: !category.active }
  })

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return { success: false, error: `Impossible de supprimer : ${productCount} produit(s) sont associés à cette catégorie.` }
  }

  const childCount = await prisma.category.count({ where: { parentId: id } })
  if (childCount > 0) {
    return { success: false, error: `Impossible de supprimer : cette catégorie possède ${childCount} sous-catégorie(s).` }
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  return { success: true }
}
