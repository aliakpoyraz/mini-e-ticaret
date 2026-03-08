import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Mail, Phone, MapPin, User, Calendar, CreditCard } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import StatusUpdateForm from './status-update-form';
import PrintButton from './print-button';
import { sendEmail } from '@/lib/resend';
import { getOrderStatusUpdateEmailHtml } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

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

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) notFound();

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true }
                    }
                }
            }
        }
    });

    if (!order) notFound();

    const updateStatus = async (formData: FormData) => {
        "use server";
        const status = formData.get('status') as string;
        console.log(`[AdminOrderUpdate] İşlem başladı. Sipariş: #${orderId}, Yeni Durum: ${status}`);

        let orderForEmail = null;

        try {
            await prisma.$transaction(async (tx) => {
                const currentOrder = await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true }
                });

                if (!currentOrder) {
                    throw new Error(`Sipariş bulunamadı: #${orderId}`);
                }

                console.log(`[AdminOrderUpdate] Mevcut durum: ${currentOrder.status}`);

                // Sadece iade edilmemiş bir durumdan RETURNED durumuna geçiliyorsa stokları geri yükle
                if (status === 'RETURNED' && !['RETURNED', 'RETURN_REQUESTED'].includes(currentOrder.status)) {
                    console.log(`[AdminOrderUpdate] Stoklar geri yükleniyor...`);
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

                console.log(`[AdminOrderUpdate] Veritabanı güncellendi. Yeni durum: ${orderForEmail.status}`);
            });

            // E-posta gönderimini transaction dışına çıkardık (daha güvenli ve hızlı)
            if (orderForEmail) {
                const updatedOrder = orderForEmail as any;
                const statusLabel = STATUS_LABELS[status] || status;
                console.log(`[AdminOrderUpdate] E-posta hazırlanıyor: ${updatedOrder.customerEmail} - Durum: ${statusLabel}`);

                try {
                    const emailRes = await sendEmail({
                        to: updatedOrder.customerEmail,
                        subject: `Sipariş Durumu Güncellemesi | YZL321 Store #${updatedOrder.id}`,
                        html: getOrderStatusUpdateEmailHtml(updatedOrder.id, statusLabel, updatedOrder.customerName)
                    });
                    console.log(`[AdminOrderUpdate] E-posta sonucu:`, emailRes);
                } catch (emailErr) {
                    console.error(`[AdminOrderUpdate] E-posta gönderimi sırasında hata (fakat DB güncellendi):`, emailErr);
                }
            }

            console.log(`[AdminOrderUpdate] İşlem başarıyla tamamlandı.`);
            revalidatePath(`/admin/orders/${orderId}`);
            revalidatePath('/admin/orders');
        } catch (err) {
            console.error(`[AdminOrderUpdate] Kritik hata:`, err);
            throw err;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 d-print-none">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            Sipariş No #{order.id}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    order.status === 'DELIVERED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                {STATUS_LABELS[order.status] || order.status}
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusUpdateForm
                        orderId={order.id}
                        initialStatus={order.status}
                        updateStatusAction={updateStatus}
                    />

                    <PrintButton />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-0">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 print:bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">FATURA</h2>
                            <p className="text-slate-500 text-sm mt-1">Sipariş No #{order.id}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-slate-900 text-lg">Store.</h3>
                            <p className="text-slate-500 text-xs mt-1">Örnek Mağaza A.Ş.</p>
                            <p className="text-slate-500 text-xs">İstanbul, Türkiye</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 print:grid-cols-2">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Müşteri</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900">{order.customerName}</p>
                                    <p className="text-slate-500 text-sm">Müşteri</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={18} className="text-slate-400 mt-0.5" />
                                <p className="text-slate-600 font-medium">{order.customerEmail}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={18} className="text-slate-400 mt-0.5" />
                                <p className="text-slate-600 font-medium">{order.customerPhone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Teslimat Adresi</h3>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-slate-400 mt-0.5" />
                            <p className="text-slate-700 font-medium leading-relaxed">
                                {order.customerAddress}
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ödeme Yöntemi</h3>
                            <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-slate-400" />
                                <span className="font-bold text-slate-700">{order.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : order.paymentMethod?.replace(/_/g, ' ') || 'Bilinmiyor'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sipariş Öğeleri</h3>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200">
                            <tr>
                                <th className="py-3 font-semibold text-slate-700">Öğe</th>
                                <th className="py-3 font-semibold text-slate-700 text-right">Birim Fiyat</th>
                                <th className="py-3 font-semibold text-slate-700 text-right">Adet</th>
                                <th className="py-3 font-semibold text-slate-700 text-right">Toplam</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4">
                                        <div className="font-bold text-slate-900">{item.variant.product.name}</div>
                                        <div className="text-slate-500 text-xs">{item.variant.name}</div>
                                    </td>
                                    <td className="py-4 text-right text-slate-600">{Number(item.price).toFixed(2)} ₺</td>
                                    <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right font-bold text-slate-900">{(Number(item.price) * item.quantity).toFixed(2)} ₺</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-slate-200 bg-slate-50/50 print:bg-transparent">
                            <tr>
                                <td colSpan={3} className="py-4 text-right font-medium text-slate-600">Ara Toplam</td>
                                <td className="py-4 text-right font-bold text-slate-900">{Number(order.total).toFixed(2)} ₺</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="py-2 text-right font-medium text-slate-600">Kargo</td>
                                <td className="py-2 text-right font-bold text-green-600">Ücretsiz</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="pt-4 pb-0 text-right font-bold text-slate-900 text-lg">Genel Toplam</td>
                                <td className="pt-4 pb-0 text-right font-bold text-slate-900 text-lg">{Number(order.total).toFixed(2)} ₺</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
