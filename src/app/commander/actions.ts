'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const orderSchema = z.object({
  customerName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  customerPhone: z.string().min(9, 'Numéro de téléphone invalide').regex(/^[0-9+\s()-]+$/, 'Numéro invalide'),
  wilaya: z.string().min(1, 'Wilaya requise'),
  commune: z.string().min(2, 'Commune requise'),
  address: z.string().optional(),
  message: z.string().optional(),
})

interface CartItemInput {
  id: string
  variantId?: string
  variantName?: string
  name: string
  price: number
  reference: string | null
  quantity: number
}

export async function placeOrder(
  formData: FormData,
  cartItems: CartItemInput[]
) {
  const raw = {
    customerName: formData.get('customerName') as string,
    customerPhone: formData.get('customerPhone') as string,
    wilaya: formData.get('wilaya') as string,
    commune: formData.get('commune') as string,
    address: formData.get('address') as string || undefined,
    message: formData.get('message') as string || undefined,
  }

  const parsed = orderSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: 'Votre panier est vide.' }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify and decrement stock for each item in transaction
      for (const item of cartItems) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true }
          })

          if (!variant) {
            throw new Error(`La variante commandée est introuvable.`)
          }

          const currentStock = variant.stock || 0
          if (currentStock < item.quantity) {
            throw new Error(
              `Stock insuffisant pour "${variant.product.name} (${variant.color})". Stock disponible: ${currentStock}, quantité demandée: ${item.quantity}.`
            )
          }

          // Decrement variant stock atomically
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          })
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.id }
          })

          if (!product) {
            throw new Error(`Le produit "${item.name}" est introuvable.`)
          }

          const currentStock = product.stock ?? 0
          if (currentStock < item.quantity) {
            throw new Error(
              `Stock insuffisant pour "${product.name}". Stock disponible: ${currentStock}, quantité demandée: ${item.quantity}.`
            )
          }

          // Decrement product stock atomically
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } }
          })
        }
      }

      // 2. Generate unique order number
      const count = await tx.order.count()
      const orderNumber = `SE-${String(count + 1).padStart(4, '0')}-${Date.now().toString().slice(-4)}`

      // 3. Create order & order items
      return await tx.order.create({
        data: {
          orderNumber,
          customerName: parsed.data.customerName,
          customerPhone: parsed.data.customerPhone,
          wilaya: parsed.data.wilaya,
          commune: parsed.data.commune,
          address: parsed.data.address || null,
          message: parsed.data.message || null,
          totalAmount,
          status: 'Nouvelle',
          orderItems: {
            create: cartItems.map(item => ({
              productId: item.id,
              productName: item.variantName ? `${item.name} (${item.variantName})` : item.name,
              productReference: item.reference,
              priceAtTime: item.price,
              quantity: item.quantity,
              totalLine: item.price * item.quantity,
            }))
          }
        }
      })
    })

    try {
      revalidatePath('/admin')
      revalidatePath('/admin/commandes')
      revalidatePath('/admin/produits')
      revalidatePath('/produits')
      revalidatePath('/produit')
      revalidatePath('/')
    } catch {}

    return { success: true, orderNumber: order.orderNumber, orderId: order.id }
  } catch (err: any) {
    return { error: err.message || 'Une erreur est survenue lors de la confirmation de votre commande.' }
  }
}

