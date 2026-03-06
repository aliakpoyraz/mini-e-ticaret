"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, MapPin, Package, Settings, LogOut, Loader2 } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Authenticate the user on the client side just to be safe
        fetch('/api/auth/me')
            .then(res => {
                if (!res.ok) {
                    router.push('/login?redirect=/account');
                } else {
                    setIsLoading(false);
                }
            })
            .catch(() => router.push('/login?redirect=/account'));
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#F5F5F7]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const navItems = [
        { name: 'Profil Bilgileri', href: '/account/profile', icon: User },
        { name: 'Adreslerim', href: '/account/addresses', icon: MapPin },
        { name: 'Siparişlerim', href: '/account/orders', icon: Package },
    ];

    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#F5F5F7]">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 lg:w-72 shrink-0">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Hesabım</h2>
                            <nav className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname.startsWith(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                                ? 'bg-slate-900 text-white font-medium shadow-md shadow-slate-900/10'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/' });
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium"
                                >
                                    <LogOut size={18} />
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
