import { prisma } from '../src/lib/prisma'
import { slugify } from '../src/lib/slug'

async function testCsvImportLogic() {
  console.log('--- TEST IMPORT CSV LOGIC ---')

  const productName = 'Trottinette CSV Test'
  const baseSlug = slugify(productName)

  // Clean existing product "Trottinette CSV Test"
  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: baseSlug }, { name: productName }] }
  })
  if (existing) {
    await prisma.product.delete({ where: { id: existing.id } })
    console.log('Ancien produit CSV de test supprimé.')
  }

  // Get a category
  const cat = await prisma.category.findFirst()
  const categoryId = cat ? cat.id : 'cat-test'

  // Input rows from CSV
  const csvRows = [
    { name: productName, color: 'Rose', reference: 'TRO-CSV-ROSE', price: 5000, stock: 10 },
    { name: productName, color: 'Bleu', reference: 'TRO-CSV-BLEU', price: 5200, stock: 7 },
    { name: productName, color: 'Noir', reference: 'TRO-CSV-NOIR', price: 5100, stock: 5 },
  ]

  // Simulate grouping logic from importer/actions.ts
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const groupedProducts: Record<string, typeof csvRows> = {}
  for (const row of csvRows) {
    const key = normalize(row.name)
    if (!groupedProducts[key]) groupedProducts[key] = []
    groupedProducts[key].push(row)
  }

  console.log(`Nombre de groupes de produits identifiés : ${Object.keys(groupedProducts).length} (Attendu: 1)`)

  // Process grouped products (same algorithm as importer/actions.ts)
  for (const [key, groupRows] of Object.entries(groupedProducts)) {
    const firstRow = groupRows[0]

    // 1. Create/Find Product
    let product = await prisma.product.findFirst({
      where: { OR: [{ slug: baseSlug }, { name: firstRow.name }] },
      include: { variants: true },
    })

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: firstRow.name,
          slug: baseSlug,
          price: firstRow.price,
          stock: 0,
          categoryId,
          active: true,
        },
        include: { variants: true },
      })
    }

    // 2. Create ProductVariants
    for (const row of groupRows) {
      if (!row.color) continue

      const existingVar = product.variants.find(
        (v) => v.color.toLowerCase() === row.color.toLowerCase()
      )

      if (existingVar) {
        await prisma.productVariant.update({
          where: { id: existingVar.id },
          data: {
            reference: row.reference,
            price: row.price,
            stock: row.stock,
          },
        })
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: row.color,
            reference: row.reference,
            price: row.price,
            stock: row.stock,
          },
        })
      }
    }
  }

  // VERIFICATION
  const createdProducts = await prisma.product.findMany({
    where: { name: productName },
    include: { variants: true }
  })

  console.log('\n================ RESULTAT DU TEST CSV ================')
  console.log(`Nombre de produits dans la table Product : ${createdProducts.length} (Attendu: 1) ${createdProducts.length === 1 ? '✅ PASS' : '❌ FAIL'}`)

  if (createdProducts.length === 1) {
    const prod = createdProducts[0]
    console.log(`Produit créé : "${prod.name}" (Slug: ${prod.slug})`)
    console.log(`Nombre de variantes dans ProductVariant : ${prod.variants.length} (Attendu: 3) ${prod.variants.length === 3 ? '✅ PASS' : '❌ FAIL'}`)
    prod.variants.forEach((v) => {
      console.log(`  └─ Variante "${v.color}" | SKU: ${v.reference} | Prix: ${v.price} DA | Stock: ${v.stock}`)
    })
  }

  console.log('====================================================')
}

testCsvImportLogic()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
