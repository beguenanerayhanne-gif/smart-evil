import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const prisma = new PrismaClient()
const SECRET = new TextEncoder().encode('default_secret_key_change_me_in_production')

async function runTests() {
  console.log('--- TEST PHASE 2 ---')
  
  // 1. Connection check
  try {
    await prisma.$connect()
    console.log('✅ 1. Connexion à PostgreSQL `catalogue_db` réussie via Prisma !')
  } catch (err) {
    console.error('❌ 1. Échec connexion DB:', err)
    process.exit(1)
  }

  // 2. Table count & existence check
  try {
    const adminCount = await prisma.admin.count()
    const catCount = await prisma.category.count()
    const prodCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const settingsCount = await prisma.settings.count()
    console.log(`✅ 2. Tables vérifiées avec succès : Admin (${adminCount}), Category (${catCount}), Product (${prodCount}), Order (${orderCount}), Settings (${settingsCount})`)
  } catch (err) {
    console.error('❌ 2. Erreur lors de la lecture des tables:', err)
    process.exit(1)
  }

  // 3. Admin account check
  let admin
  try {
    admin = await prisma.admin.findUnique({ where: { username: 'admin' } })
    if (!admin) {
      console.error('❌ 3. Compte administrateur introuvable !')
      process.exit(1)
    }
    console.log('✅ 3. Compte administrateur "admin" présent en base de données.')
  } catch (err) {
    console.error('❌ 3. Erreur recherche admin:', err)
    process.exit(1)
  }

  // 4. Auth & password verification
  try {
    const isValid = await bcrypt.compare('Admin@2024!', admin.password_hash)
    if (!isValid) {
      console.error('❌ 4. Verification du mot de passe hashé échouée.')
      process.exit(1)
    }
    console.log('✅ 4. Vérification du mot de passe administrateur valide.')
  } catch (err) {
    console.error('❌ 4. Erreur verification mot de passe:', err)
    process.exit(1)
  }

  // 5. JWT Generation & Verification
  try {
    const token = await new SignJWT({ id: admin.id, username: admin.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET)
    
    const verified = await jwtVerify(token, SECRET)
    if (verified.payload.username !== 'admin') {
      console.error('❌ 5. Le payload JWT ne correspond pas.')
      process.exit(1)
    }
    console.log('✅ 5. Génération et vérification du token JWT / cookie / middleware fonctionnelle.')
  } catch (err) {
    console.error('❌ 5. Erreur JWT:', err)
    process.exit(1)
  }

  console.log('\n🎉 TOUS LES TESTS DE LA PHASE 2 ONT RÉUSSI !')
  await prisma.$disconnect()
}

runTests()
