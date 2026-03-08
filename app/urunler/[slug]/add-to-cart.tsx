"use client";

import { useState } from 'react';
import { useCart } from '../../context/cart-context';
import { useRouter } from 'next/navigation';

type Variant = {
    id: number;
    name: string;
    price: number; // Şemada Variant'ın fiyatı yoktur, Product'ın vardır.
    stock: number;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: number;
    originalPrice?: number;
    imageUrl: string | null;
    variants: Variant[];
};

export default function AddToCartButton({ product }: { product: Product }) {
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const { addToCart } = useCart();
    const router = useRouter();

    const handleAddToCart = () => {
        if (!selectedVariantId) return;

        const variant = product.variants.find(v => v.id === selectedVariantId);
        if (!variant) return;

        addToCart({
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            description: product.description || '',
            variantName: variant.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
            quantity: 1,
            imageUrl: product.imageUrl || undefined,
            stock: variant.stock
        });

        alert("Sepete Eklendi!");
        router.push('/sepet');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                    <button
                        key={variant.id}
                        disabled={variant.stock === 0}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`px-4 py-2 border rounded ${selectedVariantId === variant.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : variant.stock === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                            }`}
                    >
                        {variant.name} ({variant.stock > 0 ? 'Stokta Var' : 'Stokta Yok'})
                    </button>
                ))}
            </div>

            <button
                onClick={handleAddToCart}
                disabled={!selectedVariantId}
                className={`w-full py-3 rounded text-lg font-semibold transition ${selectedVariantId
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                Sepete Ekle
            </button>
        </div>
    );
}
