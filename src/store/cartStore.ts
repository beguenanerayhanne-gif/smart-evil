import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  variantId?: string
  name: string
  price: number
  reference: string | null
  imageUrl: string | null
  quantity: number
  variantName?: string
  stock?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, variantId?: string, variantName?: string) => void
  updateQuantity: (id: string, quantity: number, variantId?: string, variantName?: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find(
            i => i.id === product.id && i.variantId === product.variantId && i.variantName === product.variantName
          )
          const currentQty = existing ? existing.quantity : 0
          const maxStock = product.stock ?? 999

          if (currentQty >= maxStock) {
            return state
          }

          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === product.id && i.variantId === product.variantId && i.variantName === product.variantName
                  ? { ...i, quantity: Math.min(i.quantity + 1, maxStock), stock: product.stock ?? i.stock }
                  : i
              )
            }
          }
          return { items: [...state.items, { ...product, quantity: 1 }] }
        })
      },

      removeItem: (id, variantId, variantName) => {
        set((state) => ({
          items: state.items.filter(
            i => !(i.id === id && i.variantId === variantId && i.variantName === variantName)
          )
        }))
      },

      updateQuantity: (id, quantity, variantId, variantName) => {
        if (quantity <= 0) {
          get().removeItem(id, variantId, variantName)
          return
        }
        set((state) => ({
          items: state.items.map(i => {
            if (i.id === id && i.variantId === variantId && i.variantName === variantName) {
              const maxStock = i.stock ?? 999
              return { ...i, quantity: Math.min(quantity, maxStock) }
            }
            return i
          })
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'smart-evil-cart',
    }
  )
)

