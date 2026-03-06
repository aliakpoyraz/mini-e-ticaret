"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Plus, Store, Settings, LogOut, Users, Percent, RotateCcw, MessageCircle } from 'lucide-react';

const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/products/new', label: 'Add Product', icon: Plus },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Panel', href: '/admin' },
        { icon: Package, label: 'Ürünler', href: '/admin/products' },
        { icon: ShoppingBag, label: 'Siparişler', href: '/admin/orders' },
        { icon: MessageCircle, label: 'Değerlendirmeler', href: '/admin/reviews' },
        { icon: Users, label: 'Üyeler', href: '/admin/members' },
        { icon: Percent, label: 'İndirimler/Kuponlar', href: '/admin/discounts' },
        { icon: RotateCcw, label: 'İadeler', href: '/admin/returns' },
        { icon: Settings, label: 'Ayarlar', href: '/admin/settings' },
    ];

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 fixed h-full flex flex-col z-50">
            <div className="p-8 pb-4 space-y-6">
                <Link href="/admin" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                        A.
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">Yönetici.</span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                    <Store size={14} />
                    Mağazaya Git
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-4 mt-2">
                    Platform
                </div>
                {menuItems.map((item) => {
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-2">
                <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                        AD
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Ayarlarım</p>
                        <p className="text-xs text-[#86868B]">Profil & Güvenlik</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors duration-300">
                        <Settings size={16} strokeWidth={2} className="text-[#86868B]" />
                    </div>
                </Link>

                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/admin-login';
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-xs font-bold"
                >
                    <LogOut size={14} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
