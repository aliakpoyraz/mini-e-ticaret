import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Filter, Plus } from 'lucide-react';
import ProductList from './product-list';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        include: { variants: { orderBy: { order: 'asc' } } },
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
        ]
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

            <ProductList initialProducts={products} />
        </div>
    );
}
