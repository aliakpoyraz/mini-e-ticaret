import Link from 'next/link';

export default function Footer({ storeName }: { storeName: string }) {
    return (
        <footer className="bg-white py-12 border-t border-slate-100 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} {storeName} Tüm hakları saklıdır.</p>
                <div className="flex gap-6">
                    <Link href="/privacy" className="text-slate-400 hover:text-slate-900 transition-colors">Gizlilik</Link>
                    <Link href="/terms" className="text-slate-400 hover:text-slate-900 transition-colors">Koşullar</Link>
                    <Link href="/returns" className="text-slate-400 hover:text-slate-900 transition-colors">İade Koşulları</Link>
                    <Link href="/contact" className="text-slate-400 hover:text-slate-900 transition-colors">İletişim</Link>
                </div>
            </div>
        </footer>
    );
}
