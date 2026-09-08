'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const jwtSecret = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !jwtSecret) {
  throw new Error(
    '[loginAction] JWT_SECRET is not defined. ' +
    'Set it in your Vercel environment variables before deploying.'
  )
}

const SECRET = new TextEncoder().encode(
  jwtSecret || 'default_secret_key_change_me_in_production'
)

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Veuillez remplir tous les champs.' }
  }

  // Chercher l'admin
  const admin = await prisma.admin.findUnique({
    where: { username }
  })

  if (!admin) {
    // Par mesure de sécurité, ne pas indiquer si c'est le nom d'utilisateur ou le mot de passe qui est incorrect
    return { error: 'Identifiants incorrects.' }
  }

  // Vérifier le mot de passe
  const isValid = await verifyPassword(password, admin.password_hash)

  if (!isValid) {
    return { error: 'Identifiants incorrects.' }
  }

  // Créer le JWT
  const token = await new SignJWT({ id: admin.id, username: admin.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET)

  // Sauvegarder dans un cookie HTTP-only
  const cookieStore = await cookies()
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 jour
    path: '/'
  })

  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return { success: true }
}
