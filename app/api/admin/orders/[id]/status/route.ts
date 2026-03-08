import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import { getOrderStatusUpdateEmailHtml } from '@/lib/email-templates';
import { revalidatePath } from 'next/cache';

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

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);
        const { status } = await request.json();

        console.log(`[AdminOrderUpdate - API] İşlem başladı. Sipariş: #${orderId}, Yeni Durum: ${status}`);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Geçersiz sipariş ID' }, { status: 400 });
        }

        let orderForEmail = null;

        await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (!currentOrder) {
                throw new Error(`Sipariş bulunamadı: #${orderId}`);
            }

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

            console.log(`[AdminOrderUpdate - API] E-posta gönderiliyor: ${updatedOrder.customerEmail}`);

            const emailRes = await sendEmail({
                to: updatedOrder.customerEmail,
                subject: `Sipariş Durumu Güncellemesi | YZL321 Store #${updatedOrder.id}`,
                html: getOrderStatusUpdateEmailHtml(updatedOrder.id, statusLabel, updatedOrder.customerName)
            });
            console.log(`[AdminOrderUpdate - API] E-posta sonucu:`, emailRes);
        }

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[AdminOrderUpdate - API] HATA:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
