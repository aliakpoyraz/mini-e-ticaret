import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
        productsCount,
        ordersCount,
        recentProducts,
        recentOrders,
        allOrders,
        monthlyOrders,
        lastMonthlyOrders,
        todayOrdersCount,
        lowStockCount
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.product.findMany({
            include: { variants: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        prisma.order.findMany({
            where: { status: { notIn: ['CANCELLED', 'RETURNED'] } },
            select: { total: true }
        }),
        prisma.order.findMany({
            where: {
                createdAt: { gte: firstDayOfMonth },
                status: { notIn: ['CANCELLED', 'RETURNED'] }
            },
            select: { total: true }
        }),
        prisma.order.findMany({
            where: {
                createdAt: {
                    gte: firstDayOfLastMonth,
                    lt: firstDayOfMonth
                },
                status: { notIn: ['CANCELLED', 'RETURNED'] }
            },
            select: { total: true }
        }),
        prisma.order.count({
            where: { createdAt: { gte: todayStart } }
        }),
        prisma.variant.count({
            where: { stock: { lt: 10 } }
        })
    ]);

    // Toplam Gelir
    const totalRevenue = allOrders.reduce((acc, order) => acc + Number(order.total), 0);

    // Bu ayın geliri ve büyüme oranı
    const thisMonthRevenue = monthlyOrders.reduce((acc, order) => acc + Number(order.total), 0);
    const lastMonthRevenue = lastMonthlyOrders.reduce((acc, order) => acc + Number(order.total), 0);

    let growth = 0;
    if (lastMonthRevenue > 0) {
        growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
        growth = 100;
    }

    const STATUS_LABELS: Record<string, string> = {
        'CREATED': 'Oluşturuldu',
        'PAID': 'Ödendi',
        'SHIPPED': 'Kargolandı',
        'DELIVERED': 'Teslim Edildi',
        'RETURN_REQUESTED': 'İade İstendi',
        'RETURN_REJECTED': 'İade Reddedildi',
        'RETURNED': 'İade Edildi',
        'CANCELLED': 'İptal Edildi'
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Özeti</h1>
                <p className="text-slate-500 mt-1">Tekrar hoş geldiniz. İşte mağazanızda bugün olan bitenler.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between h-40 group hover:border-brand-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Toplam Gelir</p>
                            <h3 className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</h3>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp size={16} className={growth < 0 ? 'rotate-180' : ''} />
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                        <span className="text-slate-400 font-normal ml-1">geçen aydan</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between h-40 group hover:border-brand-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Toplam Siparişler</p>
                            <h3 className="text-3xl font-bold text-slate-900">{ordersCount}</h3>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                            <ShoppingCart size={24} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                        <ArrowUpRight size={16} /> +{todayOrdersCount} yeni <span className="text-slate-400 font-normal">bugün</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between h-40 group hover:border-brand-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Aktif Ürünler</p>
                            <h3 className="text-3xl font-bold text-slate-900">{productsCount}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Package size={24} />
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {lowStockCount > 0 ? (
                            <><AlertCircle size={16} /> {lowStockCount} ürün düşük stokta</>
                        ) : (
                            'Stok durumu iyi'
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Son Siparişler</h2>
                        <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                            Tümünü Gör
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600">Sipariş No</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600">Müşteri</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600">Toplam</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{Number(order.total).toFixed(2)} ₺</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Yeni Ürünler</h2>
                        <Link href="/admin/products/new" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                            + Ürün Ekle
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600">Ürün</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600">Fiyat</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.imageUrl && (
                                                    <img src={product.imageUrl} className="w-8 h-8 rounded-lg object-cover border border-slate-200" alt="" />
                                                )}
                                                <span className="font-medium text-slate-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{Number(product.price).toFixed(2)} ₺</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/products/${product.id}/edit`} className="text-brand-600 hover:text-brand-700 font-medium text-xs hover:underline">
                                                Düzenle
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
