import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import HeroSlider from './components/HeroSlider';
import Footer from './components/Footer';
import { ArrowRight, Star } from 'lucide-react';
import FavoriteButton from './components/FavoriteButton';
import QuickAddToCartButton from './components/QuickAddToCartButton';
import { getSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  let userFavorites: number[] = [];
  if (session) {
    const favorites = await (prisma as any).favorite.findMany({
      where: { userId: session.userId }
    });
    userFavorites = favorites.map((f: any) => f.productId);
  }

  const featuredProducts = await (prisma as any).product.findMany({
    take: 4,
    include: {
      variants: true,
      discounts: {
        where: { active: true }
      },
      reviews: {
        where: { status: 'APPROVED' }
      }
    },
    orderBy: [
      { sortOrder: 'asc' },
      { id: 'desc' }
    ]
  });

  const globalDiscounts = await prisma.discount.findMany({
    where: { active: true, productId: null },
    orderBy: { value: 'desc' }
  });
  const bestGlobalDiscount = globalDiscounts.find(d => !d.minCartValue || Number(d.minCartValue) === 0);

  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  const storeName = settings?.storeName || "Store.";

  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />

      <section className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Yeni Gelenler</h2>
          <p className="text-lg text-slate-500">En yeni ürünlerimizi keşfedin. Hassas ve şık tasarımlar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product: any) => {
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
              <Link href={`/urunler/${product.slug}`} key={product.id} className="group block">
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
                    ) : product.isNew ? (
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                        Yeni
                      </span>
                    ) : null}
                  </div>
                  <FavoriteButton
                    productId={product.id}
                    initialIsFavorite={userFavorites.includes(product.id)}
                    className="absolute top-4 right-4 z-20"
                  />
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

        <div className="mt-16 text-center">
          <Link href="/urunler" className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition-colors">
            Tüm Ürünleri Gör <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">Premium Rahatlık.</h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Premium koleksiyonumuzla yaşam tarzınızı yükseltin. Kaliteye değer verenler için tasarlandı.
              </p>
              <Link href="/urunler" className="inline-block bg-white text-slate-900 px-10 py-5 rounded-full font-bold hover:bg-slate-100 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300">
                Hemen Alışveriş Yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer storeName={storeName} />
    </div>
  );
}
