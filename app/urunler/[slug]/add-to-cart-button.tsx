"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/cart-context';
import { ShoppingCart, Check, X, ArrowRight, ShoppingBag } from 'lucide-react';

type Variant = {
    id: number;
    name: string;
    stock: number;
};

type Product = {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string | null;
};

export default function AddToCartButton({ product, variants }: { product: Product, variants: Variant[] }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAdd = () => {
        if (!selectedVariant) return;
        setIsLoading(true);
        addToCart({
            productId: product.id,
            name: product.name,
            description: '',
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
            imageUrl: product.imageUrl || undefined,
            variantId: selectedVariant.id,
            variantName: selectedVariant.name,
            quantity: 1,
            stock: selectedVariant.stock
        });
        setTimeout(() => {
            setIsLoading(false);
            setShowModal(true);
        }, 600);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-wide">Varyant Seçin</label>
                <div className="flex flex-wrap gap-3">
                    {variants.map(v => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            disabled={v.stock === 0}
                            className={`px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedVariant?.id === v.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                                } ${v.stock === 0 ? 'opacity-50 cursor-not-allowed decoration-slate-400 line-through' : ''}`}
                        >
                            {v.name}
                        </button>
                    ))}
                </div>
                {selectedVariant && (
                    <p className="text-sm text-slate-500 animate-fade-in">
                        {selectedVariant.stock > 0 ? `${selectedVariant.stock} adet stokta` : 'Stokta yok'}
                    </p>
                )}
            </div>

            <button
                onClick={handleAdd}
                disabled={!selectedVariant || isLoading}
                className={`w-full py-4 px-8 rounded-full text-lg font-bold flex items-center justify-center gap-3 transition-all transform duration-200 ${!selectedVariant
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isLoading
                        ? 'bg-green-600 text-white scale-95 shadow-inner'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 hover:-translate-y-1'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2 animate-fade-in font-bold">
                        <Check size={20} />
                        Eklendi
                    </span>
                ) : (
                    <>
                        Sepete Ekle - {product.price.toFixed(2)} ₺
                    </>
                )}
            </button>

            {mounted && showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 transform transition-all animate-scale-up relative">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-scale-up">
                            <Check className="text-green-600" size={24} strokeWidth={3} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Sepete Eklendi!</h3>
                        <p className="text-slate-500 text-center text-sm mb-8">
                            Ürün başarıyla sepetinize eklendi.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push('/sepet')}
                                className="w-full flex items-center justify-between bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-colors group"
                            >
                                <span className="flex items-center gap-2">
                                    <ShoppingBag size={18} />
                                    Sepete Git
                                </span>
                                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Alışverişe Devam Et
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div >
    );
}
