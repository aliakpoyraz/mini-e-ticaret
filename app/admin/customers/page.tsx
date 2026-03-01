import { prisma } from '@/lib/prisma';
import { Search, MapPin, Phone, Mail, Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerAggregated {
    email: string;
    name: string;
    phone: string;
    address: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: Date;
}

export default async function AdminCustomersPage() {
    // Müşteri verilerini birleştirmek için tüm siparişleri getir
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Siparişleri müşteri e-postasına göre birleştir
    const customersMap = new Map<string, CustomerAggregated>();

    for (const order of orders) {
        if (!customersMap.has(order.customerEmail)) {
            customersMap.set(order.customerEmail, {
                email: order.customerEmail,
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                totalSpent: 0,
                orderCount: 0,
                lastOrderDate: order.createdAt,
            });
        }

        const customer = customersMap.get(order.customerEmail)!;
        customer.totalSpent += Number(order.total);
        customer.orderCount += 1;
        // Siparişler yeniden eskiye sıralı olduğundan, karşılaşılan ilk sipariş en sonuncusudur
    }

    const customers = Array.from(customersMap.values());

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Müşteriler</h1>
                    <p className="text-slate-500 mt-1">Müşteri listenizi görüntüleyin ve yönetin.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Müşteri ara..."
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
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[250px]">Müşteri</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">İletişim</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[250px]">Adres</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Siparişler</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Toplam Harcama</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Son Sipariş</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {customers.map((customer, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5 align-top">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all shadow-sm border border-slate-200">
                                                {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {customer.name || 'Bilinmiyor'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs shadow-sm">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {customer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            {customer.phone ? (
                                                <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {customer.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Telefon belirtilmemiş</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top">
                                        <div className="flex gap-3 items-start">
                                            <MapPin size={16} className="text-slate-300 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-slate-600 leading-relaxed max-w-[280px]">
                                                {customer.address || <span className="text-slate-400 italic">Adres yok</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top text-right">
                                        <div className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                                            {customer.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top text-right">
                                        <div className="font-bold text-slate-900 text-sm">
                                            {Number(customer.totalSpent).toFixed(2)} ₺
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top text-right">
                                        <div className="flex flex-col items-end justify-center gap-1 text-slate-600 text-sm font-medium h-8">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span>
                                                    {new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Müşteri bulunamadı</h3>
                        <p className="text-slate-500 mb-6 font-medium">Sipariş verildiğinde müşteri verileri burada görünecektir.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
