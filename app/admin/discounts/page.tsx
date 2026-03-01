import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Plus, Percent, Archive, Search } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminDiscountsPage() {
    const discounts = await prisma.discount.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            product: true
        }
    });
    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">İndirimler</h1>
                    <p className="text-slate-500 mt-1">Mağaza geneli veya ürünlere özel indirimlerinizi yönetin.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/admin/coupons/new"
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
                        >
                            <Plus size={18} />
                            <span>Yeni Kupon</span>
                        </Link>
                        <Link
                            href="/admin/discounts/new"
                            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                        >
                            <Plus size={18} />
                            <span>Yeni İndirim</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Mevcut İndirimler</h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">İndirim Adı</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tür</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Değer</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider max-w-[200px]">Koşul</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Durum</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {discounts.map((discount) => (
                                    <tr key={`discount-${discount.id}`} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                                                    <Percent size={18} className="text-purple-600" />
                                                </div>
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {discount.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                                                {discount.type === 'PERCENTAGE' ? 'Yüzdelik' : 'Sabit Tutar'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-900">
                                            {discount.type === 'PERCENTAGE' ? `%${Number(discount.value)}` : `${Number(discount.value).toFixed(2)} ₺`}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                {discount.product ? (
                                                    <span className="text-sm font-medium text-slate-700">Ürüne Özel: {discount.product.name}</span>
                                                ) : discount.minCartValue ? (
                                                    <span className="text-sm font-medium text-slate-700">Sepet Alt Limiti: {Number(discount.minCartValue).toFixed(2)} ₺</span>
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-500 italic">Koşulsuz</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${discount.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {discount.active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/discounts/${discount.id}/edit`}
                                                    className="text-brand-600 hover:text-brand-700 font-medium text-xs hover:underline"
                                                >
                                                    Düzenle
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {discounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">İndirim bulunamadı</h3>
                            <p className="text-slate-500 font-medium text-sm">Mağazanızda şu an aktif veya pasif bir kampanya/indirim yok.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Kuponlar</h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">Kupon Kodu</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tür</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Değer</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider max-w-[200px]">Sepet Alt Limit</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Kullanım</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Durum</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {coupons.map((coupon) => (
                                    <tr key={`coupon-${coupon.id}`} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <Percent size={18} className="text-orange-600" />
                                                </div>
                                                <div className="font-bold text-slate-900 text-sm font-mono tracking-wider">
                                                    {coupon.code}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                                                {coupon.type === 'PERCENTAGE' ? 'Yüzdelik' : 'Sabit Tutar'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-900">
                                            {coupon.type === 'PERCENTAGE' ? `%${Number(coupon.value)}` : `${Number(coupon.value).toFixed(2)} ₺`}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                                                {coupon.minCartValue ? `${Number(coupon.minCartValue).toFixed(2)} ₺` : <span className="text-slate-500 italic">Koşulsuz</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center text-sm text-slate-500">
                                            {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : 'Sınırsız'}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${coupon.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {coupon.active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}/edit`}
                                                    className="text-brand-600 hover:text-brand-700 font-medium text-xs hover:underline"
                                                >
                                                    Düzenle
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {coupons.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Kupon bulunamadı</h3>
                            <p className="text-slate-500 font-medium text-sm">Müşterilerinize özel promosyon kodları dağıtmak için kupon oluşturun.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
