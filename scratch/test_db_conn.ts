import { PrismaClient } from '@prisma/client'

const directUrl = "postgresql://neondb_owner:npg_28EKDXkLRcrx@ep-bitter-firefly-aemlged6.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
})

async function testConn() {
  try {
    console.log('Connexion à Neon direct c-2...')
    const cats = await prisma.category.findMany()
    console.log(`✅ Connexion réussie ! ${cats.length} catégories trouvées.`)
  } catch (err: any) {
    console.error('❌ Échec :', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConn()
