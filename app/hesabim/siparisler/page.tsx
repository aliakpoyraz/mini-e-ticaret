import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'CREATED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
        case 'RETURNED': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'CREATED': return <Clock size={16} />;
        case 'PAID': return <CheckCircle2 size={16} />;
        case 'SHIPPED': return <Truck size={16} />;
        case 'DELIVERED': return <CheckCircle2 size={16} />;
        case 'RETURNED': return <RefreshCw size={16} />;
        case 'CANCELLED': return <XCircle size={16} />;
        default: return <Clock size={16} />;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'CREATED': return 'Onay Bekliyor';
        case 'PAID': return 'Hazırlanıyor';
        case 'SHIPPED': return 'Kargoya Verildi';
        case 'DELIVERED': return 'Teslim Edildi';
        case 'RETURNED': return 'İade Edildi';
        case 'CANCELLED': return 'İptal Edildi';
        default: return status;
    }
};

export default async function OrdersPage() {
    const session = await getSession();
    if (!session) {
        redirect('/giris-yap?redirect=/hesabim/siparisler');
    }

    const orders = await prisma.order.findMany({
        where: { userId: Number(session.userId) },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true }
                    }
                }
            }
        }
    }) as any[];

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Siparişlerim</h1>
            <p className="text-slate-500 mb-8">Geçmiş ve mevcut tüm siparişlerinizi buradan takip edebilirsiniz.</p>

            {orders.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Henüz Siparişiniz Yok</h3>
                    <p className="text-slate-500 mb-6">Alışverişe başlayarak ilk siparişinizi oluşturun.</p>
                    <Link href="/urunler" className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors">
                        Alışverişe Başla
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex flex-wrap gap-x-8 gap-y-2">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Sipariş Tarihi</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Sipariş Özeti</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {order.items.length} Ürün
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Toplam Tutar</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {Number(order.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusLabel(order.status)}
                                    </div>
                                    <div className="flex-1 sm:hidden"></div>
                                    <Link
                                        href={`/siparis-takibi?id=${order.orderNumber || order.id}`}
                                        className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1 whitespace-nowrap bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        Detaylar
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5">
                                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex-none w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl border border-slate-100 overflow-hidden bg-slate-50 snap-start group">
                                            {item.variant.product.imageUrl ? (
                                                <img
                                                    src={item.variant.product.imageUrl}
                                                    alt={item.variant.product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Package />
                                                </div>
                                            )}
                                            {item.quantity > 1 && (
                                                <div className="absolute top-1 right-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 rounded-full z-10">
                                                    x{item.quantity}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
