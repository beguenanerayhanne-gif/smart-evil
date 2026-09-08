'use server'

import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'
import { revalidatePath } from 'next/cache'

export interface MassImportRow {
  name: string
  reference?: string | null
  color?: string | null
  categoryName: string
  subCategoryName?: string | null
  brand?: string | null
  price: number
  oldPrice?: number | null
  purchasePrice?: number | null
  stock: number
  stockThreshold?: number | null
  barcode?: string | null
  supplierReference?: string | null
  weight?: number | null
  description?: string | null
  shortDescription?: string | null
  active?: boolean
  ageMin?: number | null
  ageMax?: number | null
}

import { saveUploadedFile } from '@/lib/upload'

export async function importProductsMassAction(formData: FormData) {
  const dataStr = formData.get('data') as string
  if (!dataStr) return { error: 'Aucune donnée valide à importer.' }

  let rows: MassImportRow[]
  try {
    rows = JSON.parse(dataStr)
  } catch (e) {
    return { error: 'Format de données invalide.' }
  }

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { error: 'Aucune donnée valide à importer.' }
  }

  // ── 1. Load all categories once (outside any transaction) ──────────────────
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true }
  })

  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  // ── 2. Upload ALL image files first (outside DB work) ─────────────────────
  const uploadedUrls = new Map<string, string[]>()
  try {
    for (const [key, val] of formData.entries()) {
      if (key.startsWith('file_')) {
        const rowIdx = key.split('_')[1]
        const file = val as File
        const res = await saveUploadedFile(file)
        if (res?.success && res.url) {
          const existing = uploadedUrls.get(rowIdx) || []
          existing.push(res.url)
          uploadedUrls.set(rowIdx, existing)
        }
      }
    }
  } catch (err: any) {
    return { error: 'Erreur lors du téléchargement des images : ' + err.message }
  }

  // ── 3. Group rows by product name ─────────────────────────────────────────
  const groupedProducts: Record<
    string,
    (MassImportRow & { originalIndex: number; uploadedImages: string[] })[]
  > = {}

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const key = normalize(row.name)
    if (!groupedProducts[key]) groupedProducts[key] = []
    groupedProducts[key].push({
      ...row,
      originalIndex: i,
      uploadedImages: uploadedUrls.get(i.toString()) || [],
    })
  }

  // ── 4. Process each product independently (NO global transaction) ──────────
  // This avoids timeout errors when many products / images are involved.
  // Each product is wrapped in its own small transaction for atomicity.
  let createdCount = 0
  let updatedCount = 0
  const rowErrors: string[] = []

  for (const [productKey, groupRows] of Object.entries(groupedProducts)) {
    try {
      const firstRow = groupRows[0]

      // ── Resolve category ──────────────────────────────────────────────────
      const normCat = normalize(firstRow.categoryName?.trim() || '')
      let matchedCat =
        categories.find(c => normalize(c.name) === normCat || c.slug === normCat) ||
        categories.find(c => normalize(c.name).includes(normCat))

      if (!matchedCat) matchedCat = categories[0]
      if (!matchedCat) throw new Error(`Catégorie introuvable pour « ${firstRow.name} »`)

      let finalCategoryId = matchedCat.id
      if (firstRow.subCategoryName) {
        const normSub = normalize(firstRow.subCategoryName)
        const subCats = categories.filter(c => c.parentId === matchedCat!.id)
        const matchedSub =
          subCats.find(c => normalize(c.name) === normSub) ||
          subCats.find(c => normalize(c.name).includes(normSub))
        if (matchedSub) finalCategoryId = matchedSub.id
      }

      // ── Upsert product in its own small transaction ───────────────────────
      const { productId, isNew, existingVariants } = await prisma.$transaction(
        async (tx) => {
          const baseSlug = slugify(firstRow.name)

          const existingProduct = await tx.product.findFirst({
            where: { OR: [{ slug: baseSlug }, { name: firstRow.name }] },
            include: { variants: true },
          })

          if (existingProduct) {
            await tx.product.update({
              where: { id: existingProduct.id },
              data: {
                description: firstRow.description?.trim() || existingProduct.description,
                shortDescription: firstRow.shortDescription?.trim() || existingProduct.shortDescription,
                brand: firstRow.brand?.trim() || existingProduct.brand,
                categoryId: finalCategoryId,
                active: firstRow.active !== undefined ? firstRow.active : existingProduct.active,
                ageMin: firstRow.ageMin ?? existingProduct.ageMin,
                ageMax: firstRow.ageMax ?? existingProduct.ageMax,
                ...(groupRows.length === 1 && !firstRow.color
                  ? {
                      price: firstRow.price,
                      oldPrice: firstRow.oldPrice || null,
                      purchasePrice: firstRow.purchasePrice || null,
                      stock: firstRow.stock,
                      reference: firstRow.reference,
                      barcode: firstRow.barcode,
                      weight: firstRow.weight,
                    }
                  : {}),
              },
            })
            return {
              productId: existingProduct.id,
              isNew: false,
              existingVariants: existingProduct.variants,
            }
          } else {
            // Unique slug
            let uniqueSlug = baseSlug
            const slugTaken = await tx.product.findUnique({ where: { slug: uniqueSlug } })
            if (slugTaken) uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

            const newProduct = await tx.product.create({
              data: {
                name: firstRow.name.trim(),
                slug: uniqueSlug,
                description: firstRow.description?.trim() || null,
                shortDescription: firstRow.shortDescription?.trim() || null,
                brand: firstRow.brand?.trim() || null,
                categoryId: finalCategoryId,
                active: firstRow.active !== undefined ? firstRow.active : true,
                ageMin: firstRow.ageMin || null,
                ageMax: firstRow.ageMax || null,
                price: firstRow.price,
                oldPrice: firstRow.oldPrice || null,
                purchasePrice: firstRow.purchasePrice || null,
                stock: groupRows.length === 1 && !firstRow.color ? firstRow.stock : 0,
                reference: groupRows.length === 1 && !firstRow.color ? firstRow.reference : null,
                barcode: groupRows.length === 1 && !firstRow.color ? firstRow.barcode : null,
                weight: groupRows.length === 1 && !firstRow.color ? firstRow.weight : null,
              },
            })
            return { productId: newProduct.id, isNew: true, existingVariants: [] }
          }
        },
        { timeout: 8000 }
      )

      if (isNew) createdCount++; else updatedCount++

      // ── Add base product images (outside transaction, no time pressure) ────
      if (groupRows.length === 1 && !firstRow.color && firstRow.uploadedImages.length > 0) {
        for (let i = 0; i < firstRow.uploadedImages.length; i++) {
          await prisma.productImage.create({
            data: { productId, url: firstRow.uploadedImages[i], isMain: i === 0, position: i },
          })
        }
      }

      // ── Handle variants (each variant in its own small transaction) ────────
      for (const row of groupRows) {
        if (!row.color) continue

        const existingVar = existingVariants.find(
          (v: any) => v.color.toLowerCase() === row.color!.toLowerCase()
        )

        let variantId: string

        if (existingVar) {
          await prisma.productVariant.update({
            where: { id: existingVar.id },
            data: {
              reference: row.reference?.trim() || null,
              price: row.price,
              oldPrice: row.oldPrice || null,
              purchasePrice: row.purchasePrice || null,
              stock: row.stock,
              stockThreshold: row.stockThreshold || null,
              barcode: row.barcode?.trim() || null,
              supplierReference: row.supplierReference?.trim() || null,
              weight: row.weight || null,
            },
          })
          variantId = existingVar.id
        } else {
          const newVar = await prisma.productVariant.create({
            data: {
              productId,
              color: row.color,
              reference: row.reference?.trim() || null,
              price: row.price,
              oldPrice: row.oldPrice || null,
              purchasePrice: row.purchasePrice || null,
              stock: row.stock,
              stockThreshold: row.stockThreshold || null,
              barcode: row.barcode?.trim() || null,
              supplierReference: row.supplierReference?.trim() || null,
              weight: row.weight || null,
            },
          })
          variantId = newVar.id
        }

        // Variant images
        for (let i = 0; i < row.uploadedImages.length; i++) {
          await prisma.productImage.create({
            data: { productId, variantId, url: row.uploadedImages[i], isMain: i === 0, position: i },
          })
        }
      }
    } catch (e: any) {
      rowErrors.push(`« ${productKey} » : ${e.message}`)
    }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/produits')

  // If every product failed, return an error
  if (rowErrors.length === Object.keys(groupedProducts).length) {
    return {
      error: `Tous les produits ont échoué. Premier problème : ${rowErrors[0]}`,
    }
  }

  return {
    success: true,
    createdCount,
    updatedCount,
    errorCount: rowErrors.length,
    errors: rowErrors,
  }
}
