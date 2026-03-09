import { PrismaClient } from '@prisma/client';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/app/lib/auth';

const prisma = new PrismaClient();

export default async function TrackOrderPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string, email?: string }>;
}) {
    const { id: orderId, email: orderEmail } = await searchParams;
    const session = await getSession();
    const isLoggedIn = !!session;

    let order = null;
    let error = null;

    if (orderId) {
        try {
            order = await prisma.order.findFirst({
                where: {
                    OR: [
                        { id: isNaN(parseInt(orderId)) ? -1 : parseInt(orderId) },
                        { orderNumber: orderId }
                    ]
                },
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

            if (!order) {
                error = "Sipariş bulunamadı. Lütfen bilgileri kontrol edin.";
            } else {
                let isAuthorized = false;
                if (isLoggedIn && order.userId === session.userId) {
                    isAuthorized = true;
                } else if (!isLoggedIn && orderEmail && order.customerEmail === orderEmail) {
                    isAuthorized = true;
                }

                if (!isAuthorized) {
                    error = "Bu siparişi görüntüleme yetkiniz yok veya e-posta adresi eşleşmedi.";
                    order = null;
                }
            }
        } catch (e) {
            error = "Sipariş aranırken bir hata oluştu.";
        }
    }

    // Zaman çizelgesi adımları
    const statuses = [
        { key: 'CREATED', label: 'Sipariş Alındı', icon: Clock },
        { key: 'PAID', label: 'Ödeme Onaylandı', icon: CheckCircle2 },
        { key: 'SHIPPED', label: 'Kargoya Verildi', icon: Truck },
        { key: 'DELIVERED', label: 'Teslim Edildi', icon: Package },
    ];

    // Mevcut durumu indekse eşle
    const getStatusIndex = (currentStatus: string) => {
        switch (currentStatus) {
            case 'CREATED': return 0;
            case 'PAID': return 1;
            case 'SHIPPED': return 2;
            case 'DELIVERED': return 3;
            case 'RETURN_REQUESTED': return 4;
            case 'RETURNED': return -1;
            case 'RETURN_REJECTED': return 3; // Reddedilen iadeleri teslim edilmiş gibi göster
            case 'CANCELLED': return -1;
            default: return 0;
        }
    };

    const currentIndex = order ? getStatusIndex(order.status) : 0;
    const isCancelled = order?.status === 'CANCELLED';
    const isReturned = order?.status === 'RETURNED';

    const requestReturn = async (formData: FormData) => {
        "use server";
        const oId = parseInt(formData.get('orderId') as string);

        await prisma.order.update({
            where: { id: oId },
            data: { status: 'RETURN_REQUESTED' }
        });

        // Sayfayı yeniden doğrulayarak (revalidate) güncelle
        const { revalidatePath } = require('next/cache');
        revalidatePath('/siparis-takibi');
    };

    const cancelOrder = async (formData: FormData) => {
        "use server";
        const oId = parseInt(formData.get('orderId') as string);

        await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.order.findUnique({
                where: { id: oId },
                include: { items: true }
            });

            // Kargoya verilmiş veya sonrasındaki siparişlerin iptalini engelle
            if (!currentOrder || !['CREATED', 'PAID'].includes(currentOrder.status)) return;

            // Stokları geri yükle
            for (const item of currentOrder.items) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: { stock: { increment: item.quantity } }
                });
            }

            // Durumu güncelle
            await tx.order.update({
                where: { id: oId },
                data: { status: 'CANCELLED' }
            });
        });

        const { revalidatePath } = require('next/cache');
        revalidatePath('/siparis-takibi');
        revalidatePath('/admin/orders');
        revalidatePath('/admin/products');
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-12">
            <div className="container mx-auto px-6 max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Sipariş Takibi</h1>
                <p className="text-slate-500 text-center mb-10">Siparişinizin güncel durumunu öğrenmek için sipariş numaranızı girin.</p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <form className="flex flex-col gap-4" action="/siparis-takibi">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                name="id"
                                placeholder="Sipariş Numaranız (Örn: A1B2C3D4)"
                                defaultValue={orderId || ''}
                                required
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            />
                            {!isLoggedIn && (
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Sipariş E-postanız"
                                    defaultValue={orderEmail || ''}
                                    required
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                />
                            )}
                            <button
                                type="submit"
                                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
                            >
                                Sorgula
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium mb-8">
                        {error}
                    </div>
                )}

                {order && (
                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Sipariş No</p>
                                <h2 className="text-2xl font-bold text-slate-900">#{order.orderNumber || order.id}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Sipariş Tarihi</p>
                                <p className="font-semibold text-slate-900">
                                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        </div>

                        {order.status === 'DELIVERED' && (
                            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-blue-900 font-bold mb-1">İade Talebi</h3>
                                    <p className="text-blue-700 text-sm">Ürünlerinizden memnun kalmadınız mı? 14 gün içinde iade talebi oluşturabilirsiniz.</p>
                                </div>
                                <form action={requestReturn}>
                                    <input type="hidden" name="orderId" value={order.id} />
                                    <button type="submit" className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-bold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm shadow-sm">
                                        İade Talebi Oluştur
                                    </button>
                                </form>
                            </div>
                        )}

                        {['CREATED', 'PAID'].includes(order.status) && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-slate-900 font-bold mb-1">Siparişi İptal Et</h3>
                                    <p className="text-slate-600 text-sm">Siparişiniz kargoya verilmeden iptal edebilirsiniz. Ödemeniz en kısa sürede iade edilecektir.</p>
                                </div>
                                <form action={cancelOrder}>
                                    <input type="hidden" name="orderId" value={order.id} />
                                    <button type="submit" className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 font-bold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm shadow-sm">
                                        Siparişi İptal Et
                                    </button>
                                </form>
                            </div>
                        )}

                        {order.status === 'RETURN_REQUESTED' && (
                            <div className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                <h3 className="text-orange-900 font-bold mb-1">İade Talebiniz Alındı</h3>
                                <p className="text-orange-700 text-sm">İade talebiniz inceleniyor. En kısa sürede tarafınıza bilgi verilecektir.</p>
                            </div>
                        )}

                        {order.status === 'RETURN_REJECTED' && (
                            <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                                <h3 className="text-red-900 font-bold mb-1">İade Talebi Reddedildi</h3>
                                <p className="text-red-700 text-sm">İade talebiniz onaylanmadı. Detaylı bilgi için lütfen iletişime geçin.</p>
                            </div>
                        )}

                        {isCancelled || isReturned ? (
                            <div className={`p-6 rounded-xl text-center mb-8 ${isCancelled ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                                <h3 className="text-lg font-bold mb-2">
                                    {isCancelled ? 'Sipariş İptal Edildi' : 'Sipariş İade Edildi'}
                                </h3>
                                <p>Bu sipariş teslimat sürecinde değildir.</p>
                            </div>
                        ) : (
                            <div className="mb-12">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Sipariş Durumu</h3>
                                <div className="relative">
                                    <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full" />

                                    <div
                                        className="absolute top-6 left-0 h-1 bg-brand-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, (currentIndex / (statuses.length - 1)) * 100))}%` }}
                                    />

                                    <div className="relative flex justify-between">
                                        {statuses.map((step, index) => {
                                            const isCompleted = index <= currentIndex;
                                            const isActive = index === currentIndex;
                                            const Icon = step.icon;

                                            return (
                                                <div key={step.key} className="flex flex-col items-center relative z-10 w-24">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${isCompleted
                                                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                                            : 'bg-white text-slate-300 border-2 border-slate-100'
                                                            }`}
                                                    >
                                                        <Icon size={20} strokeWidth={isCompleted ? 2.5 : 2} />
                                                    </div>
                                                    <span className={`text-xs sm:text-sm font-semibold text-center ${isActive ? 'text-brand-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                                        }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Sipariş Özeti</h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                                            {item.variant.product.imageUrl ? (
                                                <img src={item.variant.product.imageUrl} alt={item.variant.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{item.variant.product.name}</h4>
                                            <p className="text-sm text-slate-500">{item.variant.name}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-medium text-slate-600">{item.quantity} Adet</span>
                                                <span className="font-bold text-slate-900">{Number(item.price).toFixed(2)} ₺</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
