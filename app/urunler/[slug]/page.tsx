import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddToCartButton from './add-to-cart-button';
import { ArrowLeft, Check, Truck, ShieldCheck, CreditCard, Headphones, Star } from 'lucide-react';
import Link from 'next/link';
import FavoriteButton from '@/app/components/FavoriteButton';
import QuickAddToCartButton from '@/app/components/QuickAddToCartButton';
import ProductImageGallery from '@/app/components/ProductImageGallery';
import { getSession } from '@/app/lib/auth';
import ReviewsSection from './components/ReviewsSection';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const isId = !isNaN(parseInt(slug));

    const product = await (prisma as any).product.findUnique({
        where: isId ? { id: parseInt(slug) } : { slug: slug },
        include: {
            variants: {
                orderBy: { order: 'asc' }
            },
            images: { orderBy: { order: 'asc' } },
            discounts: {
                where: { active: true }
            }
        }
    }) as any;

    if (!product) notFound();

    const session = await getSession();
    let isFavorite = false;
    if (session) {
        const favorite = await (prisma as any).favorite.findUnique({
            where: {
                userId_productId: {
                    userId: session.userId,
                    productId: product.id
                }
            }
        });
        if (favorite) isFavorite = true;
    }

    const globalDiscounts = await (prisma as any).discount.findMany({
        where: { active: true, productId: null },
        orderBy: { value: 'desc' }
    });
    const bestGlobalDiscount = (globalDiscounts as any[]).find(d => !d.minCartValue || Number(d.minCartValue) === 0);

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

    // Beğenebileceğiniz Ürünler (Öneriler)
    const recommendations = await (prisma as any).product.findMany({
        where: {
            category: product.category,
            id: { not: product.id }
        },
        include: {
            reviews: {
                where: { status: 'APPROVED' }
            }
        },
        take: 4
    });

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 hidden md:block transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    <div className="flex items-center gap-4">
                        {hasDiscount ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 line-through">{originalPrice.toFixed(2)} ₺</span>
                                <span className="font-bold text-red-600">{finalPrice.toFixed(2)} ₺</span>
                            </div>
                        ) : (
                            <span className="font-bold">{originalPrice.toFixed(2)} ₺</span>
                        )}
                        <QuickAddToCartButton
                            product={{
                                id: product.id,
                                name: product.name,
                                price: finalPrice,
                                originalPrice: originalPrice > finalPrice ? originalPrice : undefined,
                                imageUrl: product.imageUrl,
                                slug: product.slug
                            }}
                            variants={product.variants}
                        />
                        <FavoriteButton
                            productId={product.id}
                            initialIsFavorite={isFavorite}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 pt-36 md:pt-40 lg:pt-44 pb-24">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-24">

                    <div className="w-full md:w-5/12">
                        <div className="sticky top-32">
                            <ProductImageGallery
                                mainImageUrl={product.imageUrl}
                                images={product.images}
                                productName={product.name}
                                badge={
                                    isOutOfStock ? (
                                        <span className="bg-slate-800 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm">Stok Yok</span>
                                    ) : hasDiscount ? (
                                        <span className="bg-red-600 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm">İndirimli Ürün</span>
                                    ) : undefined
                                }
                                topRight={
                                    <FavoriteButton productId={product.id} initialIsFavorite={isFavorite} className="scale-125" />
                                }
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-7/12 space-y-10">
                        <div className="space-y-4">
                            <Link href="/urunler" className="inline-flex items-center text-gray-400 hover:text-black transition-colors font-medium text-sm mb-4">
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
                                    originalPrice: originalPrice > finalPrice ? originalPrice : undefined,
                                    imageUrl: product.imageUrl
                                }}
                                variants={product.variants}
                            />
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

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="bg-white py-24 border-t border-slate-100">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <h2 className="text-3xl font-bold text-slate-900 mb-12 tracking-tight">Beğenebileceğiniz Diğer Ürünler</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recommendations.map((rec: any) => (
                                <Link key={rec.id} href={`/urunler/${rec.slug}`} className="group block">
                                    <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-4 relative">
                                        {rec.imageUrl ? (
                                            <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">RESİM YOK</div>
                                        )}
                                        {rec.reviews && rec.reviews.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-[10px] font-bold text-slate-900">
                                                    {(rec.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / rec.reviews.length).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{rec.name}</h3>
                                    <p className="text-slate-500 text-sm">{Number(rec.price).toFixed(2)} ₺</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div className="bg-slate-50/50 border-y border-slate-100 py-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <ReviewsSection productId={product.id} />
                </div>
            </div>
        </div>
    );
}
