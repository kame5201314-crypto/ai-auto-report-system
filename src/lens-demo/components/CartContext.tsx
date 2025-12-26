import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Product, Accessory } from '../data/products'

export interface CartItem {
  type: 'product' | 'accessory'
  item: Product | Accessory
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addProduct: (product: Product) => void
  addAccessory: (accessory: Accessory) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  showBundlePopup: boolean
  setShowBundlePopup: (show: boolean) => void
  lastAddedProduct: Product | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [showBundlePopup, setShowBundlePopup] = useState(false)
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null)

  const addProduct = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { type: 'product', item: product, quantity: 1 }]
    })

    // 顯示配件推薦彈窗
    setLastAddedProduct(product)
    if (product.relatedAccessories.length > 0) {
      setShowBundlePopup(true)
    }
  }, [])

  const addAccessory = useCallback((accessory: Accessory) => {
    setItems(prev => {
      const existing = prev.find(item => item.item.id === accessory.id)
      if (existing) {
        return prev.map(item =>
          item.item.id === accessory.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { type: 'accessory', item: accessory, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.item.id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.item.id === itemId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addProduct,
        addAccessory,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        showBundlePopup,
        setShowBundlePopup,
        lastAddedProduct
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
