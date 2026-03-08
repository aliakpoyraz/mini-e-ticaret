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
    stock: number;
    imageUrl?: string;
    originalPrice?: number;
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
    const [userId, setUserId] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Authentication kontrolü
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.user?.id) {
                    setUserId(data.user.id.toString());
                }
                setIsCheckingAuth(false);
            })
            .catch(() => setIsCheckingAuth(false));
    }, []);

    // Sepeti yükle ve gerekirse birleştir
    useEffect(() => {
        if (isCheckingAuth) return;

        const guestKey = 'cart_guest';
        const userKey = userId ? `cart_${userId}` : null;

        const parseCart = (key: string) => {
            try {
                const saved = localStorage.getItem(key);
                if (!saved) return null;
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed.map((item: any) => ({
                    ...item,
                    price: Number(item.price) || 0,
                    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
                    quantity: Number(item.quantity) || 1
                })) : null;
            } catch (e) {
                return null;
            }
        };

        const initializeCart = async () => {
            if (userId) {
                // Sunucudan sepeti çek
                try {
                    const res = await fetch('/api/cart');
                    const data = await res.json();
                    let serverCart = data.items || [];
                    let guestCart = parseCart(guestKey) || [];

                    if (guestCart.length > 0) {
                        // Misafir sepetini sunucuyla birleştir
                        const resSync = await fetch('/api/cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'sync', items: guestCart })
                        });

                        if (resSync.ok) {
                            // Yeniden sunucudan güncel sepeti çek
                            const resFinal = await fetch('/api/cart');
                            const dataFinal = await resFinal.json();
                            serverCart = dataFinal.items || [];
                            localStorage.removeItem(guestKey);
                        }
                    }

                    setItems(serverCart);
                    localStorage.setItem(userKey!, JSON.stringify(serverCart));
                } catch (e) {
                    // Hata durumunda local'den devam et
                    setItems(parseCart(userKey!) || []);
                }
            } else {
                // Sadece misafir
                let guestCart = parseCart(guestKey) || [];
                if (guestCart.length === 0) {
                    const legacyCart = parseCart('cart');
                    if (legacyCart && legacyCart.length > 0) {
                        guestCart = legacyCart;
                        localStorage.removeItem('cart');
                    }
                }
                setItems(guestCart);
            }
            setIsLoaded(true);
        };

        initializeCart();
    }, [isCheckingAuth, userId]);

    // Değişiklikleri kaydet
    useEffect(() => {
        if (!isLoaded) return;
        const storageKey = userId ? `cart_${userId}` : 'cart_guest';
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, isLoaded, userId]);

    const addToCart = async (newItem: CartItem) => {
        const existing = items.find(item => item.variantId === newItem.variantId);
        const newQuantity = existing
            ? Math.min(newItem.stock, existing.quantity + (newItem.quantity || 1))
            : Math.min(newItem.stock, newItem.quantity || 1);

        setItems(current => {
            if (existing) {
                return current.map(item =>
                    item.variantId === newItem.variantId ? { ...item, quantity: newQuantity } : item
                );
            }
            return [...current, { ...newItem, quantity: newQuantity }];
        });

        if (userId) {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId: newItem.variantId, quantity: newQuantity })
            });
        }
    };

    const updateQuantity = async (variantId: number, quantity: number) => {
        if (quantity < 1) return;
        const item = items.find(i => i.variantId === variantId);
        if (!item) return;

        const finalQuantity = Math.min(item.stock, quantity);
        setItems(current =>
            current.map(i => i.variantId === variantId ? { ...i, quantity: finalQuantity } : i)
        );

        if (userId) {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId, quantity: finalQuantity })
            });
        }
    };

    const removeFromCart = async (variantId: number) => {
        setItems(current => current.filter(item => item.variantId !== variantId));
        if (userId) {
            await fetch(`/api/cart?variantId=${variantId}`, { method: 'DELETE' });
        }
    };

    const clearCart = async () => {
        setItems([]);
        if (userId) {
            await fetch('/api/cart?variantId=all', { method: 'DELETE' });
        }
    };

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
