'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

const KEYS = ['shop_name', 'hero_title', 'hero_subtitle', 'contact_phone', 'contact_address']

export async function updateSettings(formData: FormData) {
  const updates = KEYS.map(key => ({
    key,
    value: (formData.get(key) as string) ?? '',
  }))

  await Promise.all(
    updates.map(({ key, value }) =>
      prisma.settings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  )

  revalidatePath('/')
  revalidatePath('/admin/parametres')
}

export async function createAdminAction(formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!username || !password) {
    return { error: 'Nom d utilisateur et mot de passe requis.' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  const existing = await prisma.admin.findUnique({ where: { username } })
  if (existing) {
    return { error: 'Un administrateur avec ce nom existe déjà.' }
  }

  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(password, salt)

  await prisma.admin.create({
    data: {
      username,
      password_hash
    }
  })

  revalidatePath('/admin/parametres')
  return { success: true }
}

export async function deleteAdminAction(adminId: string) {
  const count = await prisma.admin.count()
  if (count <= 1) {
    return { error: 'Impossible de supprimer le dernier administrateur.' }
  }

  await prisma.admin.delete({ where: { id: adminId } })
  revalidatePath('/admin/parametres')
  return { success: true }
}
