"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [priceMin, setPriceMin] = useState(searchParams.get('min') || '');
    const [priceMax, setPriceMax] = useState(searchParams.get('max') || '');
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [isOpenMobile, setIsOpenMobile] = useState(false);

    useEffect(() => {
        setSearch(searchParams.get('q') || '');
        setPriceMin(searchParams.get('min') || '');
        setPriceMax(searchParams.get('max') || '');
        setSort(searchParams.get('sort') || 'newest');
    }, [searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (search.trim()) {
            const safeSearch = search.trim()
                .replace(/İ/g, 'i') // Büyük İ -> küçük i
                .replace(/I/g, 'i') // Büyük I -> küçük ı
                .toLowerCase();

            params.set('q', safeSearch);
        } else {
            params.delete('q');
        }

        if (priceMin) params.set('min', priceMin); else params.delete('min');
        if (priceMax) params.set('max', priceMax); else params.delete('max');
        if (sort !== 'newest') params.set('sort', sort); else params.delete('sort');
        params.delete('page');

        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        setPriceMin('');
        setPriceMax('');
        setSearch('');
        setSort('newest');
        router.push('/products');
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpenMobile(!isOpenMobile)}
                className="w-full flex items-center justify-between p-4 lg:hidden bg-slate-50 font-bold text-slate-900 border-b border-slate-100"
            >
                <div className="flex items-center gap-2">
                    <Filter size={18} /> Filtreler
                </div>
                {isOpenMobile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <div className={`p-4 space-y-8 ${isOpenMobile ? 'block' : 'hidden'} lg:block`}>
                <h3 className="font-bold text-xl text-slate-900 hidden lg:block">Filtreler</h3>

                {/* Arama Inputu */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 block">Ara</label>
                    <div className="relative group">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Anahtar Kelime..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
                        />
                        <Search
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                        />
                    </div>
                </div>

                {/* Fiyat Aralığı */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 block">Fiyat Aralığı</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            placeholder="En Az"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="number"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            placeholder="En Çok"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                    </div>
                </div>

                {/* Sıralama */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 block">Sıralama</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                    >
                        <option value="newest">En Yeniler</option>
                        <option value="price_asc">Artan Fiyat</option>
                        <option value="price_desc">Azalan Fiyat</option>
                        <option value="rating_desc">Puan (Yüksekten Düşüğe)</option>
                    </select>
                </div>

                {/* Yıldız Filtresi */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 block">Puan</label>
                    <div className="flex flex-col gap-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <label key={star} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={searchParams.get('rating') === star.toString()}
                                    onChange={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set('rating', star.toString());
                                        router.push(`/products?${params.toString()}`);
                                    }}
                                    className="w-4 h-4 accent-slate-900"
                                />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-4 h-4 ${i < star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-slate-600 ml-1">{star === 5 ? '5 Yıldız' : `${star} Yıldız ve Üstü`}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Butonlar */}
                <div className="flex flex-col gap-2 pt-2">
                    <button
                        onClick={applyFilters}
                        className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition-all active:scale-[0.98]"
                    >
                        Filtreleri Uygula
                    </button>

                    {(search || priceMin || priceMax || sort !== 'newest') && (
                        <button
                            onClick={clearFilters}
                            className="w-full text-slate-500 rounded-xl py-2 font-medium text-sm hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={14} /> Tümünü Temizle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}