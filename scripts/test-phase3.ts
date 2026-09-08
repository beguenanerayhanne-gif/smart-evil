import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function runPhase3Tests() {
  console.log('==========================================')
  console.log('       RÉSULTAT DES TESTS PHASE 3         ')
  console.log('==========================================')

  // 1. Multi-Admin Check & Creation
  try {
    const username = `testadmin_${Date.now()}`
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash('Admin@2026Pass', salt)

    const newAdmin = await prisma.admin.create({
      data: { username, password_hash }
    })
    console.log(`✅ 1. MULTI-ADMIN : Nouvel administrateur "${newAdmin.username}" créé avec succès en BDD.`)

    const totalAdmins = await prisma.admin.count()
    console.log(`   --> Nombre d administrateurs actifs en BDD : ${totalAdmins}`)

    // Cleanup test admin
    await prisma.admin.delete({ where: { id: newAdmin.id } })
  } catch (err) {
    console.error('❌ Erreur lors du test Multi-Admin:', err)
    process.exit(1)
  }

  // 2. Category Lifecycle (Create, Read, Update, Toggle, Delete)
  let categoryId = ''
  try {
    const slugTest = `cat-test-${Date.now()}`
    const category = await prisma.category.create({
      data: {
        name: 'Catégorie Test Phase 3',
        slug: slugTest,
        active: true,
      }
    })
    categoryId = category.id
    console.log(`✅ 2. CATÉGORIES : Création réussie (ID: ${category.id}, Slug: ${category.slug})`)

    // Update
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: 'Catégorie Test Modifiée', active: false }
    })
    if (updatedCategory.name !== 'Catégorie Test Modifiée' || updatedCategory.active !== false) {
      throw new Error('Mise à jour catégorie non conforme')
    }
    console.log('✅ 3. CATÉGORIES : Modification & désactivation fonctionnelles.')
  } catch (err) {
    console.error('❌ Erreur lors du test des catégories:', err)
    process.exit(1)
  }

  // 3. Product Lifecycle (Create, Search, Update, Images, Delete)
  let productId = ''
  try {
    const prodSlug = `prod-test-${Date.now()}`
    const product = await prisma.product.create({
      data: {
        name: 'Produit Test Smartphone',
        slug: prodSlug,
        reference: 'REF-TEST-001',
        description: 'Description du produit test',
        price: 45000,
        oldPrice: 50000,
        stock: 15,
        active: true,
        categoryId: categoryId,
        images: {
          create: [
            { url: '/uploads/test-img1.png', isMain: true, position: 0 },
            { url: '/uploads/test-img2.png', isMain: false, position: 1 },
          ]
        }
      },
      include: { images: true, category: true }
    })
    productId = product.id
    console.log(`✅ 4. PRODUITS : Création produit réussie avec Prix (45,000 DA), Ancien prix (50,000 DA), Stock (15) et ${product.images.length} image(s).`)

    // Search query test
    const found = await prisma.product.findMany({
      where: { OR: [{ name: { contains: 'Smartphone', mode: 'insensitive' } }] }
    })
    if (found.length === 0) throw new Error('Recherche produit échouée')
    console.log(`✅ 5. RECHERCHE : Recherche par mot clé fonctionnelle (${found.length} résultat trouvé).`)

    // Delete product & images
    await prisma.productImage.deleteMany({ where: { productId } })
    await prisma.product.delete({ where: { id: productId } })
    console.log('✅ 6. PRODUITS : Suppression de produit & images associées fonctionnelle.')
  } catch (err) {
    console.error('❌ Erreur lors du test des produits:', err)
    process.exit(1)
  } finally {
    if (categoryId) {
      await prisma.category.delete({ where: { id: categoryId } })
    }
    await prisma.$disconnect()
  }

  console.log('\n🎉 TOUS LES TESTS DE LA PHASE 3 ONT RÉUSSI AVEC SUCCÈS !')
}

runPhase3Tests()
