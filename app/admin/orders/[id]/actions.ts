"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/resend';
import { getOrderStatusUpdateEmailHtml } from '@/lib/email-templates';

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

export async function updateOrderStatus(orderId: number, status: string) {
    console.log(`[AdminOrderUpdate - ACTION] İşlem başladı. Sipariş: #${orderId}, Yeni Durum: ${status}`);

    try {
        let orderForEmail = null;

        await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (!currentOrder) {
                throw new Error(`Sipariş bulunamadı: #${orderId}`);
            }

            console.log(`[AdminOrderUpdate - ACTION] Mevcut durum: ${currentOrder.status}`);

            // Sadece iade edilmemiş bir durumdan RETURNED durumuna geçiliyorsa stokları geri yükle
            if (status === 'RETURNED' && !['RETURNED', 'RETURN_REQUESTED'].includes(currentOrder.status)) {
                console.log(`[AdminOrderUpdate - ACTION] Stoklar geri yükleniyor...`);
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

            console.log(`[AdminOrderUpdate - ACTION] Veritabanı güncellendi.`);
        });

        if (orderForEmail) {
            const updatedOrder = orderForEmail as any;
            const statusLabel = STATUS_LABELS[status] || status;
            console.log(`[AdminOrderUpdate - ACTION] E-posta gönderiliyor: ${updatedOrder.customerEmail} - Durum: ${statusLabel}`);

            const emailRes = await sendEmail({
                to: updatedOrder.customerEmail,
                subject: `Sipariş Durumu Güncellemesi | YZL321 Store #${updatedOrder.id}`,
                html: getOrderStatusUpdateEmailHtml(updatedOrder.id, statusLabel, updatedOrder.customerName)
            });
            console.log(`[AdminOrderUpdate - ACTION] E-posta sonucu:`, emailRes);
        }

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');

        return { success: true };
    } catch (err: any) {
        console.error(`[AdminOrderUpdate - ACTION] Kritik hata:`, err.message);
        return { success: false, error: err.message };
    }
}
