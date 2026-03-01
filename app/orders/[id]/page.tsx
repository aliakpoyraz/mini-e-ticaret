import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Package, User, MapPin, CreditCard, ArrowRight, Home, Phone } from 'lucide-react';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { items: { include: { variant: { include: { product: true } } } } }
    });

    if (!order) {
        notFound();
    }

    const paymentMethod = order.paymentMethod || 'UNKNOWN';

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Sipariş Onaylandı!</h1>
                    <p className="text-slate-600 text-lg">Siparişiniz için teşekkür ederiz. Hazırlıklara başladık.</p>
                    <div className="mt-4 inline-block bg-white px-4 py-2 rounded-full border border-slate-200">
                        <span className="text-slate-500 text-sm">Sipariş No: </span>
                        <span className="text-slate-900 font-mono font-bold">#{order.id}</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Package className="text-brand-600" /> Sipariş Öğeleri
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-2">
                                    <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        <Package size={20} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{item.variant.product.name}</h3>
                                        <p className="text-sm text-slate-500">Varyant: {item.variant.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{Number(item.price).toFixed(2)} ₺</p>
                                        <p className="text-xs text-slate-500">Adet: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Toplam Tutar</span>
                            <span className="text-3xl font-bold text-slate-900">{Number(order.total).toFixed(2)} ₺</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Müşteri Bilgileri</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-brand-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-900">{order.customerName}</p>
                                        <p className="text-sm text-slate-500">{order.customerEmail}</p>
                                    </div>
                                </div>
                                {order.customerPhone && (
                                    <div className="flex items-start gap-3">
                                        <Phone size={18} className="text-brand-600 shrink-0 mt-0.5" />
                                        <p className="font-medium text-slate-900">{order.customerPhone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Teslimat & Ödeme</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-brand-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {order.customerAddress}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard size={18} className="text-brand-600 shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-slate-900">
                                        {paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : paymentMethod.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:text-brand-600 transition shadow-sm">
                        <Home size={18} /> Ana Sayfaya Dön
                    </Link>
                    <Link href="/products" className="flex items-center gap-2 px-6 py-3 bg-brand-600 rounded-xl text-white font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20">
                        Alışverişe Devam Et <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
