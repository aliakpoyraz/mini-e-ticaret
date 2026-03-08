import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Search, Filter, Phone, MapPin, User, CreditCard, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { variant: { include: { product: true } } } } }
    });

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

    const updateStatus = async (formData: FormData) => {
        "use server";
        const orderId = parseInt(formData.get('orderId') as string);
        const status = formData.get('status') as string;

        console.log(`[AdminOrdersList] İşlem başladı. Sipariş: #${orderId}, Yeni Durum: ${status}`);

        try {
            let orderForEmail = null;

            await prisma.$transaction(async (tx) => {
                const currentOrder = await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true }
                });

                if (!currentOrder) return;

                // Sadece iade edilmemiş bir durumdan RETURNED durumuna geçiliyorsa stokları geri yükle
                if (status === 'RETURNED' && !['RETURNED', 'RETURN_REQUESTED'].includes(currentOrder.status)) {
                    for (const item of currentOrder.items) {
                        await tx.variant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } }
                        });
                    }
                }

                orderForEmail = await tx.order.update({
                    where: { id: orderId },
                    data: { status }
                });
            });

            if (orderForEmail) {
                const updatedOrder = orderForEmail as any;
                const statusLabel = STATUS_LABELS[status] || status;

                console.log(`[AdminOrdersList] E-posta gönderiliyor: ${updatedOrder.customerEmail}`);

                const { sendEmail } = await import('@/lib/resend');
                const { getOrderStatusUpdateEmailHtml } = await import('@/lib/email-templates');

                await sendEmail({
                    to: updatedOrder.customerEmail,
                    subject: `Sipariş Durumu Güncellemesi | YZL321 Store #${updatedOrder.id}`,
                    html: getOrderStatusUpdateEmailHtml(updatedOrder.id, statusLabel, updatedOrder.customerName)
                });
            }

            revalidatePath('/admin/orders');
            revalidatePath('/admin/products');
            revalidatePath('/admin/returns');
        } catch (error) {
            console.error('[AdminOrdersList] HATA:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Siparişler</h1>
                    <p className="text-slate-500 mt-1">Müşteri siparişlerinizi yönetin ve takip edin.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Sipariş ara..."
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
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[80px]">Sipariş</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Müşteri</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Teslimat</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ödeme</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.map((order) => {
                                const paymentMethod = order.paymentMethod || 'UNKNOWN';
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-4 font-bold text-slate-900 align-top text-sm">
                                            <Link href={`/admin/orders/${order.id}`} className="hover:text-blue-600 transition-colors">
                                                #{order.id}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="truncate max-w-[150px]">{order.customerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs pl-8 truncate max-w-[150px]">
                                                    {order.customerEmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
                                                    {order.customerPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex gap-3 items-start">
                                                <MapPin size={16} className="text-slate-300 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-600 leading-relaxed max-w-[200px] break-words">
                                                    {order.customerAddress}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${paymentMethod === 'CREDIT_CARD' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {paymentMethod === 'CREDIT_CARD' && <CreditCard size={12} />}
                                                {paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : paymentMethod.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="font-bold text-slate-900 text-sm whitespace-nowrap">
                                                {Number(order.total).toFixed(2)} ₺
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 font-medium whitespace-nowrap">
                                                {order.items.length} ürün
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right align-top">
                                            <div className="flex flex-col items-end gap-3 min-w-[220px]">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap ${order.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        order.status === 'DELIVERED' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                            'bg-slate-50 text-slate-700 border-slate-100'
                                                    }`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>

                                                <form action={updateStatus} className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <input type="hidden" name="orderId" value={order.id} />
                                                    <select
                                                        name="status"
                                                        defaultValue={order.status}
                                                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg p-1.5 pr-6 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer font-medium appearance-none w-[130px]"
                                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.25rem center", backgroundRepeat: "no-repeat", backgroundSize: "1em 1em" }}
                                                    >
                                                        <option value="CREATED">Oluşturuldu</option>
                                                        <option value="PAID">Ödendi</option>
                                                        <option value="SHIPPED">Kargolandı</option>
                                                        <option value="DELIVERED">Teslim Edildi</option>
                                                        <option value="RETURN_REQUESTED">İade İstendi</option>
                                                        <option value="RETURNED">İade Edildi</option>
                                                        <option value="RETURN_REJECTED">İade Reddedildi</option>
                                                    </select>
                                                    <button type="submit" className="text-white bg-slate-900 hover:bg-black text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                                                        Kaydet
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Sipariş bulunamadı</h3>
                        <p className="text-slate-500 mb-6 font-medium">Yeni siparişler burada onaylanacaktır.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
