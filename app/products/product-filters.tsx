"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State tanımlamaları
    const [priceMin, setPriceMin] = useState(searchParams.get('min') || '');
    const [priceMax, setPriceMax] = useState(searchParams.get('max') || '');
    const [search, setSearch] = useState(searchParams.get('q') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (priceMin) params.set('min', priceMin);
        if (priceMax) params.set('max', priceMax);

        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        setPriceMin('');
        setPriceMax('');
        setSearch('');
        router.push('/products');
    };

    return (
        <div className="space-y-8">
            <h3 className="font-bold text-xl text-slate-900">Filtreler</h3>

            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 block">Ara</label>
                <div className="relative">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Anahtar Kelime..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transaction-colors"
                    />
                    <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 block">Fiyat Aralığı</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="En Az"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <span className="text-slate-300">-</span>
                    <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="En Çok"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={applyFilters}
                    className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition-colors"
                >
                    Filtreleri Uygula
                </button>
                {(search || priceMin || priceMax) && (
                    <button
                        onClick={clearFilters}
                        className="w-full text-slate-500 rounded-xl py-2 font-medium text-sm hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={14} /> Tümünü Temizle
                    </button>
                )}
            </div>
        </div>
    );
}
