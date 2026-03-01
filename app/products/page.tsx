import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search } from 'lucide-react';
import ProductFilters from './product-filters';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; min?: string; max?: string; category?: string }> }) {
    const { q, min, max, category } = await searchParams;

    // Filtre Mantığı
    const filters: any = {};
    if (q) filters.name = { contains: q }; // Prisma ile basit arama
    if (min) filters.price = { gte: parseFloat(min) };
    if (max) {
        filters.price = { ...filters.price, lte: parseFloat(max) };
    }
    if (category) filters.category = category;

    const products = await prisma.product.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
            variants: true,
            discounts: {
                where: { active: true }
            }
        }
    });

    // Koşulsuz genel indirimleri getir
    const globalDiscounts = await prisma.discount.findMany({
        where: { active: true, productId: null },
        orderBy: { value: 'desc' }
    });
    // Sepet alt limiti olmayan en iyi genel indirimi bul
    const bestGlobalDiscount = globalDiscounts.find(d => !d.minCartValue || Number(d.minCartValue) === 0);

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-50 border-b border-slate-200 pt-32 pb-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Tüm Ürünler</h1>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Premium ürünlerimizin en yeni koleksiyonunu keşfedin. Yaşam için tasarlandı.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="sticky top-24">
                            <ProductFilters />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {products.map((product) => {
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
                                    <Link key={product.id} href={`/products/${product.id}`} className="group block">
                                        <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden mb-6 relative">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold bg-slate-50">
                                                    RESİM YOK
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                {isOutOfStock ? (
                                                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                                                        Stok Yok
                                                    </span>
                                                ) : hasDiscount ? (
                                                    <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                                                        İndirim
                                                    </span>
                                                ) : (
                                                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                                                        Yeni
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h3>

                                                {hasDiscount ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {originalPrice.toFixed(2)} ₺
                                                        </span>
                                                        <span className="font-bold text-red-600">
                                                            {finalPrice.toFixed(2)} ₺
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-slate-900">
                                                        {originalPrice.toFixed(2)} ₺
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        {products.length === 0 && (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Ürün bulunamadı</h3>
                                <p className="text-slate-500">Aramanızı veya filtrelerinizi değiştirmeyi deneyin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
