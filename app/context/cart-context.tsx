"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
    productId: number;
    variantId: number;
    name: string;
    description: string;
    variantName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    removeFromCart: (variantId: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // LocalStorage'dan yükle ve doğrula
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Hatalı verileri düzelt (Örn: NaN fiyat/miktar)
                const sanitized = Array.isArray(parsed) ? parsed.map((item: any) => ({
                    ...item,
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1
                })) : [];
                setItems(sanitized);
            } catch (e) {
                console.error("Failed to parse cart", e);
                localStorage.removeItem('cart'); // Hatalı veriyi temizle
            }
        }
    }, []);

    // LocalStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(item => item.variantId === newItem.variantId);
            const validItem = { ...newItem, price: Number(newItem.price) || 0 };

            if (existing) {
                return current.map(item =>
                    item.variantId === newItem.variantId
                        ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                        : item
                );
            }
            return [...current, { ...validItem, quantity: newItem.quantity || 1 }];
        });
    };

    const updateQuantity = (variantId: number, quantity: number) => {
        if (quantity < 1) return;
        setItems(current =>
            current.map(item =>
                item.variantId === variantId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (variantId: number) => {
        setItems(current => current.filter(item => item.variantId !== variantId));
    };

    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
