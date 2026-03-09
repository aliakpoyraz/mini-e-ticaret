import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import ProductFilters from './product-filters';
import FavoriteButton from '../components/FavoriteButton';
import { getSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// Türkçe karakterleri normalize eder (büyük/küçük harf duyarsız karşılaştırma için)
function normalizeTR(str: string): string {
    return str
        .replace(/[\u0131]/g, 'i')  // ı → i
        .replace(/[\u0130]/g, 'i')  // İ → i
        .replace(/[\u011f\u011e]/g, 'g')  // ğ/Ğ → g
        .replace(/[\u00fc\u00dc]/g, 'u')  // ü/Ü → u
        .replace(/[\u015f\u015e]/g, 's')  // ş/Ş → s
        .replace(/[\u00f6\u00d6]/g, 'o')  // ö/Ö → o
        .replace(/[\u00e7\u00c7]/g, 'c')  // ç/Ç → c
        .toLowerCase();
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; min?: string; max?: string; category?: string; sort?: string; rating?: string }> }) {
    const searchParamsObj = await searchParams;
    const q = searchParamsObj.q || '';
    const min = searchParamsObj.min ? Number(searchParamsObj.min) : undefined;
    const max = searchParamsObj.max ? Number(searchParamsObj.max) : undefined;
    const ratingFilter = searchParamsObj.rating ? Number(searchParamsObj.rating) : undefined;
    const category = searchParamsObj.category;
    const sort = searchParamsObj.sort || 'newest';

    const session = await getSession();
    let userFavorites: number[] = [];
    if (session) {
        const favorites = await (prisma as any).favorite.findMany({
            where: { userId: session.userId }
        });
        userFavorites = favorites.map((f: any) => f.productId);
    }

    // Filtre Mantığı
    const where: any = {};
    if (category) where.category = category;
    if (min !== undefined || max !== undefined) {
        where.price = {};
        if (min !== undefined) where.price.gte = min;
        if (max !== undefined) where.price.lte = max;
    }

    let orderByConfig: any = [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') {
        orderByConfig = { price: 'asc' };
    } else if (sort === 'price_desc') {
        orderByConfig = { price: 'desc' };
    } else if (sort === 'name_asc') {
        orderByConfig = { name: 'asc' };
    } else if (sort === 'name_desc') {
        orderByConfig = { name: 'desc' };
    }

    const products = await (prisma as any).product.findMany({
        where,
        orderBy: sort === 'rating_desc' ? undefined : orderByConfig, // Rating sıralamasını manuel yapacağız
        include: {
            variants: true,
            discounts: {
                where: { active: true }
            },
            reviews: {
                where: { status: 'APPROVED' }
            }
        }
    });

    // Her ürün için ortalama puanı hesapla
    const productsWithRating = products.map((p: any) => {
        const avgRating = p.reviews.length > 0
            ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length
            : 0;
        return { ...p, avgRating };
    });

    // Filtreleme
    let filteredProducts = productsWithRating;

    // Arama filtrelemesi
    if (q) {
        const normalizedQ = normalizeTR(q);
        filteredProducts = filteredProducts.filter((p: any) =>
            normalizeTR(p.name).includes(normalizedQ)
        );
    }

    // Yıldız filtrelemesi
    if (ratingFilter !== undefined) {
        filteredProducts = filteredProducts.filter((p: any) => p.avgRating >= ratingFilter);
    }

    // Puan sıralaması (eğer seçilmişse)
    if (sort === 'rating_desc') {
        filteredProducts.sort((a: any, b: any) => b.avgRating - a.avgRating);
    }

    const categories = Array.from(new Set(filteredProducts.map((p: any) => p.category).filter(Boolean)));

    // Koşulsuz genel indirimleri getir
    const globalDiscounts = await (prisma as any).discount.findMany({
        where: { active: true, productId: null },
        orderBy: { value: 'desc' }
    });
    // Sepet alt limiti olmayan en iyi genel indirimi bul
    const bestGlobalDiscount = (globalDiscounts as any[]).find((d: any) => !d.minCartValue || Number(d.minCartValue) === 0);

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-50 border-b border-slate-200 pt-40 pb-16">
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
                            {filteredProducts.map((product: any) => {
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

                                const totalStock = product.variants.reduce((total: number, variant: any) => total + variant.stock, 0);
                                const isOutOfStock = totalStock === 0;

                                return (
                                    <div key={product.id} className="group relative">
                                        {/* Clickable card area */}
                                        <Link href={`/urunler/${product.slug}`} className="block">
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
                                                <div className="absolute top-4 left-4 z-10">
                                                    {isOutOfStock ? (
                                                        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                                                            Stok Yok
                                                        </span>
                                                    ) : hasDiscount ? (
                                                        <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                                                            İndirim
                                                        </span>
                                                    ) : product.isNew ? (
                                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                                                            Yeni
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {product.reviews && product.reviews.length > 0 && (
                                                    <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {(product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">({product.reviews.length})</span>
                                                    </div>
                                                )}
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

                                        {/* Favori butonu */}
                                        <FavoriteButton
                                            productId={product.id}
                                            initialIsFavorite={userFavorites.includes(product.id)}
                                            className="absolute top-4 right-4 z-30"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {filteredProducts.length === 0 && (
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

