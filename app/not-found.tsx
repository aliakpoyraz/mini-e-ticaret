import Link from 'next/link';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                    <h1 className="text-9xl font-bold tracking-tighter text-slate-900">404</h1>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
                        Sayfa Bulunamadı
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Aradığınız adres (ürün veya sayfa) yanlış olabilir ya da yayından kaldırılmış olabilir.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all duration-300 active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        <Home size={18} />
                        Ana Sayfaya Dön
                    </Link>
                    <Link
                        href="/products"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-900 rounded-full font-medium hover:bg-slate-200 transition-all duration-300 active:scale-95"
                    >
                        <Search size={18} />
                        Ürünlere Göz At
                    </Link>
                </div>
            </div>
        </div>
    );
}
