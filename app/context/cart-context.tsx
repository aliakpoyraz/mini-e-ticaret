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
                    quantity: Number(item.quantity) || 1
                })) : null;
            } catch (e) {
                return null;
            }
        };

        if (userId) {
            let userCart = parseCart(userKey!) || [];
            let guestCart = parseCart(guestKey);

            if (guestCart && guestCart.length > 0) {
                // Misafir sepetini kullanıcı sepetine aktar (merge)
                let merged = [...userCart];
                guestCart.forEach(gItem => {
                    const existing = merged.find(uItem => uItem.variantId === gItem.variantId);
                    if (existing) {
                        existing.quantity += gItem.quantity;
                    } else {
                        merged.push(gItem);
                    }
                });
                setItems(merged);
                localStorage.setItem(userKey!, JSON.stringify(merged));
                localStorage.removeItem(guestKey); // Aktarım bitti, temizle
            } else {
                setItems(userCart);
            }
        } else {
            // Sadece misafir
            let guestCart = parseCart(guestKey) || [];

            // Eğer cart_guest boşsa ama eski 'cart' anahtarı doluysa, onu taşı (Geriye Dönük Uyumluluk)
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
    }, [isCheckingAuth, userId]);

    // Değişiklikleri kaydet
    useEffect(() => {
        if (!isLoaded) return;
        const storageKey = userId ? `cart_${userId}` : 'cart_guest';
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, isLoaded, userId]);

    const addToCart = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(item => item.variantId === newItem.variantId);
            const validItem = { ...newItem, price: Number(newItem.price) || 0 };

            if (existing) {
                return current.map(item =>
                    item.variantId === newItem.variantId
                        ? { ...item, quantity: Math.min(item.stock, item.quantity + (newItem.quantity || 1)) }
                        : item
                );
            }
            return [...current, { ...validItem, quantity: Math.min(newItem.stock, newItem.quantity || 1) }];
        });
    };

    const updateQuantity = (variantId: number, quantity: number) => {
        if (quantity < 1) return;
        setItems(current =>
            current.map(item =>
                item.variantId === variantId ? { ...item, quantity: Math.min(item.stock, quantity) } : item
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
