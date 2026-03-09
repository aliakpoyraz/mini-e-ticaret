"use client";

import { useCart } from '../context/cart-context';
import { ShoppingCart, Check, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

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
    slug: string;
};

export default function QuickAddToCartButton({ product, variants, className = '' }: { product: Product, variants: Variant[], className?: string }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const hasOptions = variants.length > 1;
    const isOutOfStock = variants.every(v => v.stock === 0);

    useEffect(() => { setMounted(true); }, []);

    if (isOutOfStock) return null;

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasOptions) {
            setShowPicker(true);
        } else {
            // Single variant — add directly
            const variant = variants[0];
            if (!variant || variant.stock === 0) return;
            doAddToCart(variant);
        }
    };

    const doAddToCart = (variant: Variant) => {
        setIsAdding(true);
        addToCart({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
            imageUrl: product.imageUrl || undefined,
            variantId: variant.id,
            variantName: variant.name,
            description: '',
            quantity: 1,
            stock: variant.stock
        });
        setTimeout(() => {
            setIsAdding(false);
            setShowPicker(false);
            setShowSuccess(true);
        }, 400);
    };

    const handleVariantSelect = (variant: Variant) => {
        setSelectedVariant(variant);
        doAddToCart(variant);
    };

    const inStockVariants = variants.filter(v => v.stock > 0);

    return (
        <>
            <button
                onClick={handleButtonClick}
                className={`p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl shadow-sm hover:shadow-xl hover:scale-110 transition-all duration-300 ${className}`}
                title={hasOptions ? "Varyant Seç" : "Sepete Ekle"}
            >
                {isAdding ? (
                    <Check size={20} className="text-green-600" />
                ) : hasOptions ? (
                    <Plus size={20} />
                ) : (
                    <ShoppingCart size={20} />
                )}
            </button>

            {/* Variant Picker Modal */}
            {mounted && showPicker && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPicker(false); }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-scale-up border border-slate-100">
                        {/* Product Info */}
                        <div className="flex items-center gap-4 mb-6">
                            {product.imageUrl && (
                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-none bg-slate-100">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-sm leading-tight">{product.name}</h3>
                                <p className="text-brand-600 font-bold text-sm mt-0.5">{product.price.toFixed(2)} ₺</p>
                            </div>
                            <button
                                onClick={() => setShowPicker(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Varyant Seçin</p>
                        <div className="flex flex-wrap gap-2">
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => v.stock > 0 && handleVariantSelect(v)}
                                    disabled={v.stock === 0 || isAdding}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${v.stock === 0
                                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white'
                                        }`}
                                >
                                    {v.name}
                                    {v.stock === 0 && <span className="ml-1 text-[10px]">(Yok)</span>}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push(`/urunler/${product.slug}`)}
                            className="mt-4 text-xs text-brand-600 hover:text-brand-700 font-semibold w-full text-center"
                        >
                            Ürün sayfasına git →
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Success Modal */}
            {mounted && showSuccess && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-scale-up relative border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <Check className="text-green-600" size={24} strokeWidth={3} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Sepete Eklendi!</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">
                            <span className="font-semibold text-slate-700">{product.name}</span> sepetinize eklendi.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { setShowSuccess(false); router.push('/sepet'); }}
                                className="w-full flex items-center justify-between bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-colors group"
                            >
                                <span className="flex items-center gap-2"><ShoppingBag size={18} /> Sepete Git</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Alışverişe Devam Et
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
