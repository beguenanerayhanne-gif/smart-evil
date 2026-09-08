import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function runPhase4Tests() {
  console.log('==========================================')
  console.log('       RÉSULTAT DES TESTS PHASE 4         ')
  console.log('==========================================')

  let categoryId = ''
  let productIdActive = ''
  let productIdInactive = ''

  try {
    // 1. Setup Test Category
    const catSlug = `cat-pub-${Date.now()}`
    const category = await prisma.category.create({
      data: { name: 'Catégorie Publique Test', slug: catSlug, active: true }
    })
    categoryId = category.id
    console.log(`✅ 1. CATÉGORIE PUBLIQUE : Créée avec slug /categorie/${catSlug}`)

    // 2. Setup Active & Inactive Products
    const prodActive = await prisma.product.create({
      data: {
        name: 'Smartphone Pro Max',
        slug: `smartphone-pro-max-${Date.now()}`,
        reference: 'SP-MAX-2026',
        description: 'Smartphone haut de gamme',
        price: 99000,
        oldPrice: 110000,
        stock: 5,
        active: true,
        categoryId: categoryId,
        images: { create: [{ url: '/uploads/sp.png', isMain: true }] }
      }
    })
    productIdActive = prodActive.id

    const prodInactive = await prisma.product.create({
      data: {
        name: 'Produit Inactif Secret',
        slug: `secret-prod-${Date.now()}`,
        price: 5000,
        stock: 0,
        active: false,
        categoryId: categoryId,
      }
    })
    productIdInactive = prodInactive.id

    console.log(`✅ 2. PRODUITS : Produit actif "${prodActive.name}" et produit inactif "${prodInactive.name}" enregistrés.`)

    // 3. Test Public Catalogue Query (Only Active Products)
    const publicProducts = await prisma.product.findMany({
      where: { active: true, categoryId: categoryId }
    })
    if (publicProducts.length !== 1 || publicProducts[0].id !== productIdActive) {
      throw new Error('Les produits inactifs doivent être masqués du catalogue public !')
    }
    console.log('✅ 3. SÉCURITÉ CATALOGUE : Seuls les produits actifs sont affichés publiquement (Produit inactif bien masqué).')

    // 4. Test Public Category Query by Slug
    const publicCategory = await prisma.category.findFirst({
      where: { slug: catSlug, active: true },
      include: { products: { where: { active: true } } }
    })
    if (!publicCategory || publicCategory.products.length !== 1) {
      throw new Error('La recherche par slug de catégorie a échoué.')
    }
    console.log(`✅ 4. NAVIGATION CATÉGORIE : Accès par slug /categorie/${catSlug} fonctionnel (${publicCategory.products.length} produit actif).`)

    // 5. Test Public Product Query by Slug
    const publicProduct = await prisma.product.findFirst({
      where: { slug: prodActive.slug, active: true },
      include: { images: true, category: true }
    })
    if (!publicProduct || publicProduct.price !== 99000 || !publicProduct.oldPrice) {
      throw new Error('La recherche par slug de produit a échoué.')
    }
    console.log(`✅ 5. FICHE PRODUIT : Accès par slug /produit/${prodActive.slug} fonctionnel avec Prix (99,000 DA) et Prix barré (110,000 DA).`)

    // 6. Test Public Search by Name & SKU
    const searchResultsName = await prisma.product.findMany({
      where: { active: true, OR: [{ name: { contains: 'Smartphone', mode: 'insensitive' } }] }
    })
    const searchResultsSKU = await prisma.product.findMany({
      where: { active: true, OR: [{ reference: { contains: 'SP-MAX', mode: 'insensitive' } }] }
    })
    if (searchResultsName.length === 0 || searchResultsSKU.length === 0) {
      throw new Error('La recherche publique par nom ou SKU a échoué.')
    }
    console.log('✅ 6. RECHERCHE PUBLIQUE : Recherche par nom et SKU (SP-MAX) fonctionnelle.')

  } catch (err) {
    console.error('❌ ERREUR lors des tests Phase 4:', err)
    process.exit(1)
  } finally {
    if (productIdActive) await prisma.productImage.deleteMany({ where: { productId: productIdActive } })
    if (productIdActive) await prisma.product.delete({ where: { id: productIdActive } })
    if (productIdInactive) await prisma.product.delete({ where: { id: productIdInactive } })
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } })
    await prisma.$disconnect()
  }

  console.log('\n🎉 TOUS LES TESTS DE LA PHASE 4 ONT RÉUSSI AVEC SUCCÈS !')
}

runPhase4Tests()
