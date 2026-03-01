import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Search, RotateCcw, Check, X, User, MapPin, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage() {
    const returnOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ['RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED']
            }
        },
        orderBy: { updatedAt: 'desc' },
        include: { items: { include: { variant: { include: { product: true } } } } }
    });

    const approveReturn = async (formData: FormData) => {
        "use server";
        const orderId = parseInt(formData.get('orderId') as string);

        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (!order || order.status !== 'RETURN_REQUESTED') return;

            // Stokları geri yükle
            for (const item of order.items) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: { stock: { increment: item.quantity } }
                });
            }

            // Durumu güncelle
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'RETURNED' }
            });
        });

        revalidatePath('/admin/returns');
        revalidatePath('/admin/products');
        revalidatePath('/admin/orders');
    };

    const rejectReturn = async (formData: FormData) => {
        "use server";
        const orderId = parseInt(formData.get('orderId') as string);

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'RETURN_REJECTED' }
        });

        revalidatePath('/admin/returns');
        revalidatePath('/admin/orders');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">İadeler</h1>
                    <p className="text-slate-500 mt-1">İade taleplerini onaylayın veya reddedin.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="İade ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-[100px]">Sipariş</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">Müşteri</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[240px]">Teslimat</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tutar/İçerik</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Durum/İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {returnOrders.map((order) => {
                                const paymentMethod = order.paymentMethod || 'UNKNOWN';
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-900 align-top text-sm">
                                            <Link href={`/admin/orders/${order.id}`} className="hover:text-blue-600 transition-colors">
                                                #{order.id}
                                            </Link>
                                            <div className="text-xs text-slate-400 font-medium mt-1">
                                                {new Date(order.updatedAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <User size={12} />
                                                    </div>
                                                    {order.customerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
                                                    {order.customerEmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
                                                    {order.customerPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 align-top">
                                            <div className="flex gap-3 items-start">
                                                <MapPin size={16} className="text-slate-300 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-600 leading-relaxed max-w-[280px]">
                                                    {order.customerAddress}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 align-top">
                                            <div className="font-bold text-slate-900 text-sm">
                                                {Number(order.total).toFixed(2)} ₺
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 font-medium">
                                                {order.items.length} ürün
                                            </div>
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${paymentMethod === 'CREDIT_CARD' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                    }`}>
                                                    {paymentMethod === 'CREDIT_CARD' && <CreditCard size={12} />}
                                                    {paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : paymentMethod.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right align-top">
                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${order.status === 'RETURN_REQUESTED' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                    order.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'RETURN_REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-slate-50 text-slate-700 border-slate-100'
                                                    }`}>
                                                    {order.status === 'RETURN_REQUESTED' ? 'Talep Edildi' :
                                                        order.status === 'RETURNED' ? 'İade Edildi' :
                                                            order.status === 'RETURN_REJECTED' ? 'Reddedildi' : order.status}
                                                </span>

                                                {order.status === 'RETURN_REQUESTED' && (
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <form action={rejectReturn}>
                                                            <input type="hidden" name="orderId" value={order.id} />
                                                            <button
                                                                type="submit"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors"
                                                            >
                                                                <X size={14} />
                                                                Reddet
                                                            </button>
                                                        </form>
                                                        <form action={approveReturn}>
                                                            <input type="hidden" name="orderId" value={order.id} />
                                                            <button
                                                                type="submit"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                            >
                                                                <Check size={14} />
                                                                Onayla
                                                            </button>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {returnOrders.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                            <RotateCcw size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">İade talebi bulunamadı</h3>
                        <p className="text-slate-500 mb-6 font-medium">Bütün iade talepleri değerlendirilmiş veya henüz talep yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
