'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  })
  revalidatePath(`/admin/commandes/${orderId}`)
  revalidatePath('/admin/commandes')
  revalidatePath('/admin')
  return { success: true }
}
