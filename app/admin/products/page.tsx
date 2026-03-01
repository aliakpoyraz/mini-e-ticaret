import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        include: { variants: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ürün Envanteri</h1>
                    <p className="text-slate-500 mt-1">Ürün kataloğunuzu ve stok seviyelerinizi yönetin.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href="/admin/products/new" className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-0.5 transition-all text-sm">
                        <Plus size={18} /> Yeni Ekle
                    </Link>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Ürün ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors text-sm font-medium">
                    <Filter size={18} /> Filtreler
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ürün</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Fiyat</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Varyantlar</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map((product) => {
                                const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
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
                                        <td className="px-8 py-5 font-bold text-slate-900 text-sm">
                                            {Number(product.price).toFixed(2)} ₺
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-slate-700">{product.variants.length} varyant</span>
                                                <div className="text-xs text-slate-400">
                                                    {product.variants.slice(0, 2).map(v => v.name).join(', ')}
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
            </div>
        </div>
    );
}
