"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Toast } from '@/app/components/Toast';
import { useRouter } from 'next/navigation';

type ProductListProps = {
    initialProducts: any[];
};

export default function ProductList({ initialProducts }: ProductListProps) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const moveProduct = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === products.length - 1)
        ) {
            return;
        }

        const newProducts = [...products];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        [newProducts[index], newProducts[swapIndex]] = [newProducts[swapIndex], newProducts[index]];

        setProducts(newProducts);
    };

    const handleSaveOrder = async () => {
        setIsSaving(true);
        const orderedIds = products.map(p => p.id);

        try {
            const res = await fetch('/api/products/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });

            if (res.ok) {
                setShowToast(true);
                router.refresh();
            } else {
                alert("Sıralama güncellenemedi.");
            }
        } catch (error) {
            console.error(error);
            alert("Sıralama güncellenirken hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const hasOrderChanged = products.some((p, i) => p.id !== initialProducts[i]?.id);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
            {hasOrderChanged && (
                <div className="bg-brand-50 border-b border-brand-100 p-4 flex items-center justify-between sticky top-0 z-10">
                    <p className="text-sm text-brand-700 font-semibold">Sıralama değiştirildi. Kaydetmek ister misiniz?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setProducts(initialProducts)}
                            className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-white rounded-lg transition"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSaveOrder}
                            disabled={isSaving}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-brand-700 transition disabled:opacity-50"
                        >
                            {isSaving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-5 py-5 text-xs font-bold text-slate-400 w-24 text-center">Sıra</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ürün</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Durum</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Fiyat</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Varyantlar</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {products.map((product, index) => {
                            const totalStock = product.variants.reduce((acc: any, v: any) => acc + v.stock, 0);
                            return (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-5 py-5 text-center">
                                        <div className="flex flex-col items-center justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => moveProduct(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-inherit"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                                            <button
                                                onClick={() => moveProduct(index, 'down')}
                                                disabled={index === products.length - 1}
                                                className="p-1 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-inherit"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm relative">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <div className="w-4 h-4 bg-slate-200 rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 block text-sm">{product.name}</span>
                                                <span className="text-[11px] font-medium text-slate-400">ID: #{product.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {product.isNew && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100 uppercase tracking-widest">
                                                Yenİ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 text-sm">
                                        {Number(product.price).toFixed(2)} ₺
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-slate-700">{product.variants.length} varyant</span>
                                            <div className="text-xs text-slate-400">
                                                {product.variants.slice(0, 2).map((v: any) => v.name).join(', ')}
                                                {product.variants.length > 2 && '...'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${totalStock === 0 ? 'bg-red-50 text-red-600 border-red-100' :
                                            totalStock < 10 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            {totalStock} adet mevcut
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="flex items-center gap-2 bg-slate-900 text-white hover:bg-black px-4 py-2 rounded-full transition-all text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                            >
                                                Düzenle
                                            </Link>
                                            <button className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz ürün yok</h3>
                    <p className="text-slate-500 mb-8 font-medium">Envantere ilk ürününüzü ekleyerek başlayın.</p>
                    <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-slate-900/20 hover:bg-black hover:-translate-y-1 transition-all">
                        <Plus size={20} /> Ürün Ekle
                    </Link>
                </div>
            )}

            <Toast
                show={showToast}
                message="Ürün sıralaması başarıyla güncellendi."
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
