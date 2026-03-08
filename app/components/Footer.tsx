import Link from 'next/link';
import { Github } from 'lucide-react';
export default function Footer({ storeName }: { storeName: string }) {
    return (
        <footer className="bg-white py-12 border-t border-slate-100 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} {storeName} Tüm hakları saklıdır.</p>
                <div className="flex flex-wrap justify-center md:justify-end gap-6 items-center">
                    <a
                        href="https://github.com/aliakpoyraz/mini-e-ticaret"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                        title="Proje Kodlarını İncele"
                    >
                        <Github size={18} />
                        <span className="font-medium text-sm">Açık Kaynak Kodları</span>
                    </a>
                    <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                    <Link href="/gizlilik-politikasi" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Gizlilik</Link>
                    <Link href="/kullanim-kosullari" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Koşullar</Link>
                    <Link href="/iade-kosullari" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">İade Koşulları</Link>
                    <Link href="/iletisim" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">İletişim</Link>
                </div>
            </div>
        </footer>
    );
}
