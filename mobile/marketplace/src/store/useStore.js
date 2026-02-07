import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthStore = create(
    persist(
        (set) => ({
        user: null,
        token: null,
        login: (userData, token) => set({ user: userData, token }),
        logout: () => {
            set({ user: null, token: null })
            try {
                useCartStore.getState().clearCart()
            } catch (_) {
                console.log('Cart store not found or clearCart missing')
            }
        },
        updateUser: (updatedUser) => set({ user: updatedUser }),
        }),
        {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

export const useCartStore = create(
    persist(
        (set, get) => ({
        cartItems: [],
        addToCart: (product, qty = 1) => {
            const currentItems = get().cartItems
            const existItem = currentItems.find((x) => x.product === product._id)

            if (existItem) {
            set({
                cartItems: currentItems.map((x) =>
                x.product === product._id ? { ...existItem, qty: existItem.qty + qty } : x
                ),
            })
            } else {
            set({
                cartItems: [...currentItems, { 
                product: product._id, 
                name: product.name, 
                image: product.image, 
                price: product.price, 
                countInStock: product.countInStock, 
                qty 
                }],
            })
            }
        },
        removeFromCart: (id) =>
            set({ cartItems: get().cartItems.filter((x) => x.product !== id) }),
        clearCart: () => set({ cartItems: [] }),

        getSummary: () => {
            const items = get().cartItems
            const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0)
            const shippingPrice = itemsPrice > 100000 ? 0 : 20000 
            const taxPrice = 0.11 * itemsPrice 
            const totalPrice = itemsPrice + shippingPrice + taxPrice
            return { itemsPrice, shippingPrice, taxPrice, totalPrice }
        }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)