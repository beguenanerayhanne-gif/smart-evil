import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📞 Updating contact phone number and social media links...')

  const settingsToUpsert = [
    { key: 'contact_phone', value: '0556901248' },
    { key: 'facebook_url', value: 'https://www.facebook.com/smarteveil' },
    { key: 'instagram_url', value: 'https://www.instagram.com/smarteveil' },
  ]

  for (const s of settingsToUpsert) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    })
    console.log(`✅ Setting updated: ${s.key} = ${s.value}`)
  }

  console.log('🎉 Contact settings updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
