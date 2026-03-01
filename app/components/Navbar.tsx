"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../context/cart-context';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';

export default function Navbar({ storeName = "Store." }: { storeName?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { items } = useCart();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Admin sayfalarında Navbar'ı gizle
    if (pathname.startsWith('/admin')) return null;

    return (
        <nav className="fixed -top-2 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">

                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
                    {storeName}
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Ürünler
                    </Link>
                    <Link href="/track-order" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Sipariş Takibi
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        İletişim
                    </Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <Search size={20} strokeWidth={1.5} />
                    </button>

                    <Link href="/cart" className="relative text-slate-600 hover:text-slate-900 transition-colors">
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <button className="md:hidden text-slate-600 hover:text-slate-900 transition-colors">
                        <Menu size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Arama arayüzü */}
            {mounted && isSearchOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <button
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 text-white hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors animate-fade-in"
                    >
                        <X size={28} strokeWidth={2} />
                    </button>

                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 transform transition-all animate-scale-up relative">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6 text-center">Ne arıyorsunuz?</h2>
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} strokeWidth={2} />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ürün adı, koleksiyon..."
                                className="w-full pl-12 pr-24 py-4 md:py-5 rounded-2xl border border-slate-200 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20 bg-slate-50 transition-all font-medium"
                            />
                            {searchQuery.trim() && (
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Ara
                                </button>
                            )}
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </nav>
    );
}
