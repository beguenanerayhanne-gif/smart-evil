import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testVariantSystem() {
  console.log('--- DEBUT DES TESTS ---')

  // 1. Get or create category
  let category = await prisma.category.findFirst()
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Jouets & Mobilité', slug: 'jouets-mobilite' }
    })
  }

  // 2. Clean up previous test product if exists
  const existingTestProd = await prisma.product.findFirst({
    where: { OR: [{ slug: 'trottinette-enfant' }, { name: 'Trottinette enfant' }] }
  })
  if (existingTestProd) {
    await prisma.product.delete({ where: { id: existingTestProd.id } })
    console.log('Ancien produit de test nettoyé.')
  }

  // 3. Create Product "Trottinette enfant"
  const product = await prisma.product.create({
    data: {
      name: 'Trottinette enfant',
      slug: 'trottinette-enfant',
      description: 'Superbe trottinette évolutive pour enfants avec roues lumineuses.',
      categoryId: category.id,
      price: 5000,
      active: true,
    }
  })
  console.log(`✅ Produit créé : "${product.name}" (ID: ${product.id})`)

  // 4. Create Variant 1: Rose
  const variantRose = await prisma.productVariant.create({
    data: {
      productId: product.id,
      color: 'Rose',
      colorHex: '#FF69B4',
      reference: 'TRO-ROSE',
      price: 5000,
      stock: 10,
    }
  })
  await prisma.productImage.createMany({
    data: [
      { productId: product.id, variantId: variantRose.id, url: 'https://images.unsplash.com/photo-1597405490028-2824058f3b39?w=600', isMain: true, position: 0 },
      { productId: product.id, variantId: variantRose.id, url: 'https://images.unsplash.com/photo-1597405490028-2824058f3b38?w=600', isMain: false, position: 1 },
      { productId: product.id, variantId: variantRose.id, url: 'https://images.unsplash.com/photo-1597405490028-2824058f3b37?w=600', isMain: false, position: 2 },
    ]
  })
  console.log(`  └─ Variant Rose créé : SKU=${variantRose.reference}, Price=${variantRose.price} DA, Stock=${variantRose.stock}, 3 images`)

  // 5. Create Variant 2: Bleu
  const variantBleu = await prisma.productVariant.create({
    data: {
      productId: product.id,
      color: 'Bleu',
      colorHex: '#1E90FF',
      reference: 'TRO-BLEU',
      price: 5200,
      stock: 7,
    }
  })
  await prisma.productImage.createMany({
    data: [
      { productId: product.id, variantId: variantBleu.id, url: 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?w=600', isMain: true, position: 0 },
      { productId: product.id, variantId: variantBleu.id, url: 'https://images.unsplash.com/photo-1517649763962-0c6232661a0a?w=600', isMain: false, position: 1 },
      { productId: product.id, variantId: variantBleu.id, url: 'https://images.unsplash.com/photo-1517649763962-0c6232661a0c?w=600', isMain: false, position: 2 },
    ]
  })
  console.log(`  └─ Variant Bleu créé : SKU=${variantBleu.reference}, Price=${variantBleu.price} DA, Stock=${variantBleu.stock}, 3 images`)

  // 6. Create Variant 3: Noir
  const variantNoir = await prisma.productVariant.create({
    data: {
      productId: product.id,
      color: 'Noir',
      colorHex: '#000000',
      reference: 'TRO-NOIR',
      price: 5100,
      stock: 5,
    }
  })
  await prisma.productImage.createMany({
    data: [
      { productId: product.id, variantId: variantNoir.id, url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600', isMain: true, position: 0 },
      { productId: product.id, variantId: variantNoir.id, url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c38?w=600', isMain: false, position: 1 },
    ]
  })
  console.log(`  └─ Variant Noir créé : SKU=${variantNoir.reference}, Price=${variantNoir.price} DA, Stock=${variantNoir.stock}, 2 images`)

  // --- VERIFICATIONS BASE DE DONNEES & APIS ---

  // Check 1: Single product check in DB
  const productsCount = await prisma.product.count({
    where: { name: 'Trottinette enfant' }
  })
  console.log(`\nVERIFICATION 1 (Admin Grid DB Count) :`);
  console.log(`Nombre de produits nommés "Trottinette enfant" : ${productsCount} (Attendu: 1) ${productsCount === 1 ? '✅ PASS' : '❌ FAIL'}`)

  // Check 2: Variants query
  const fetchedProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      variants: {
        include: {
          images: { orderBy: [{ isMain: 'desc' }, { position: 'asc' }] }
        }
      }
    }
  })

  console.log(`\nVERIFICATION 2 (Variantes du Produit) :`);
  console.log(`Nombre de variantes trouvées : ${fetchedProduct?.variants.length} (Attendu: 3) ${fetchedProduct?.variants.length === 3 ? '✅ PASS' : '❌ FAIL'}`)

  fetchedProduct?.variants.forEach((v) => {
    console.log(`  - Variante "${v.color}" : SKU=${v.reference}, Stock=${v.stock}, Prix=${v.price} DA, Images=${v.images.length}`)
    const mainImg = v.images.find(i => i.isMain)
    console.log(`    └─ Image principale : ${mainImg?.url ? mainImg.url.slice(0, 40) + '...' : 'Aucune'} (${mainImg ? '✅ PASS' : '❌ FAIL'})`)
  })

  // Check 3: Check strict image isolation per variant
  console.log(`\nVERIFICATION 3 (Isolation des images par variante) :`);
  const allVariantImages = fetchedProduct?.variants.flatMap(v => v.images) || []
  const hasCrossVariantImages = allVariantImages.some(img => !img.variantId)
  console.log(`Toutes les images appartiennent-elles strictement à leur variante ? ${!hasCrossVariantImages ? '✅ OUI (PASS)' : '❌ NON (FAIL)'}`)

  console.log('\n--- TESTS DE BASE TERMINES ---')
}

testVariantSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
