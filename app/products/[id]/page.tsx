import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddToCartButton from './add-to-cart-button';
import { ArrowLeft, Check, Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
            variants: true,
            discounts: {
                where: { active: true }
            }
        }
    });

    if (!product) notFound();

    const globalDiscounts = await prisma.discount.findMany({
        where: { active: true, productId: null },
        orderBy: { value: 'desc' }
    });
    const bestGlobalDiscount = globalDiscounts.find(d => !d.minCartValue || Number(d.minCartValue) === 0);

    let finalPrice = Number(product.price);
    let originalPrice = finalPrice;
    let hasDiscount = false;
    let activeDiscount = null;

    if (product.discounts && product.discounts.length > 0) {
        activeDiscount = product.discounts[0];
    } else if (bestGlobalDiscount) {
        activeDiscount = bestGlobalDiscount;
    }

    if (activeDiscount) {
        hasDiscount = true;
        if (activeDiscount.type === 'PERCENTAGE') {
            finalPrice = finalPrice - (finalPrice * Number(activeDiscount.value) / 100);
        } else if (activeDiscount.type === 'FIXED') {
            finalPrice = Math.max(0, finalPrice - Number(activeDiscount.value));
        }
    }

    const totalStock = product.variants.reduce((total, variant) => total + variant.stock, 0);
    const isOutOfStock = totalStock === 0;

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 hidden md:block">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    {hasDiscount ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 line-through">{originalPrice.toFixed(2)} ₺</span>
                            <span className="font-bold text-red-600">{finalPrice.toFixed(2)} ₺</span>
                        </div>
                    ) : (
                        <span className="font-bold">{originalPrice.toFixed(2)} ₺</span>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 md:py-20 lg:py-24">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-24">

                    <div className="w-full md:w-1/2">
                        <div className="sticky top-32">
                            <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden relative shadow-inner">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl uppercase tracking-widest">
                                        Resim Yok
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 z-10">
                                    {isOutOfStock ? (
                                        <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm">
                                            Stok Yok
                                        </span>
                                    ) : hasDiscount ? (
                                        <span className="bg-red-600 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm">
                                            İndirimli Ürün
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <Link href="/products" className="inline-flex items-center text-gray-400 hover:text-black transition-colors font-medium text-sm mb-4">
                                <ArrowLeft size={16} className="mr-2" /> Mağazaya Dön
                            </Link>
                            <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                            {hasDiscount ? (
                                <div className="flex flex-col items-start gap-1">
                                    <p className="text-xl text-slate-400 line-through font-medium">
                                        {originalPrice.toFixed(2)} ₺
                                    </p>
                                    <p className="text-4xl font-bold text-red-600">
                                        {finalPrice.toFixed(2)} ₺
                                    </p>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-slate-900">
                                    {originalPrice.toFixed(2)} ₺
                                </p>
                            )}
                            <p className="text-lg text-slate-600 leading-relaxed pt-4">
                                {product.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <AddToCartButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: finalPrice, // İndirimli fiyatı gönder
                                    imageUrl: product.imageUrl
                                }}
                                variants={product.variants}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-slate-50 rounded-2xl h-fit text-slate-900">
                                <Truck size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Ücretsiz Kargo</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">100₺ üzeri tüm siparişlerde. Hızlı teslimat takibi.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-slate-50 rounded-2xl h-fit text-slate-900">
                                <ShieldCheck size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">2 Yıl Garanti</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">İçinizin rahat olması için tam güvence.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-slate-50 rounded-2xl h-fit text-slate-900">
                                <CreditCard size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Güvenli Ödeme</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Şifreli 256-bit SSL koruması.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-slate-50 rounded-2xl h-fit text-slate-900">
                                <Headphones size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">7/24 Destek</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">İhtiyaç duyduğunuz her an uzman desteği.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
