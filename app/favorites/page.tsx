import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/app/lib/auth';
import FavoriteButton from '@/app/components/FavoriteButton';
import QuickAddToCartButton from '@/app/components/QuickAddToCartButton';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Favorileriniz</h1>
                    <p className="text-slate-500 mb-8">Favoriye aldığınız ürünleri görmek için giriş yapmalısınız.</p>
                    <Link href="/login" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition w-full shadow-lg shadow-brand-500/30">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    const savedFavorites = await prisma.favorite.findMany({
        where: { userId: session.userId },
        include: {
            product: {
                include: {
                    variants: true,
                    discounts: {
                        where: { active: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const products = savedFavorites.map(f => f.product).filter(Boolean);

    // Genel indirimleri getir
    const globalDiscounts = await prisma.discount.findMany({
        where: { active: true, productId: null },
        orderBy: { value: 'desc' }
    });
    const bestGlobalDiscount = globalDiscounts.find(d => !d.minCartValue || Number(d.minCartValue) === 0);

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-50 border-b border-slate-200 pt-32 pb-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Favorilerim</h1>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Beğendiğiniz ürünler
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl max-w-2xl mx-auto">
                        <div className="text-6xl mb-6">🤍</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Henüz favori ürününüz yok</h3>
                        <p className="text-slate-500 mb-8">Mağazayı keşfedin ve beğendiğiniz ürünleri favorilere ekleyin.</p>
                        <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg">
                            <ArrowLeft size={20} /> Alışverişe Başla
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => {
                            if (!product) return null;

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
                                <Link href={`/products/${product.id}`} key={product.id} className="group block">
                                    <div className="bg-slate-50 rounded-[2rem] overflow-hidden aspect-[3/4] mb-6 relative transition-transform duration-500 group-hover:-translate-y-1 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">Resim Yok</div>
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
                                            ) : null}
                                        </div>
                                        <FavoriteButton
                                            productId={product.id}
                                            initialIsFavorite={true}
                                            className="absolute top-4 right-4 z-20"
                                        />
                                        <QuickAddToCartButton
                                            product={{
                                                id: product.id,
                                                name: product.name,
                                                price: finalPrice,
                                                imageUrl: product.imageUrl
                                            }}
                                            variants={product.variants}
                                            className="absolute bottom-4 right-4 z-20"
                                        />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                            <p className="text-slate-500 text-sm mt-1 line-clamp-1">{product.description}</p>
                                        </div>
                                        {hasDiscount ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-400 line-through">
                                                    {originalPrice.toFixed(2)} ₺
                                                </span>
                                                <span className="font-bold text-red-600 text-lg">
                                                    {finalPrice.toFixed(2)} ₺
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-slate-900 text-lg">{originalPrice.toFixed(2)} ₺</span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
