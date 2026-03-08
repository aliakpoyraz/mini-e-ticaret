import React from 'react';
import { Mail, Phone, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = {
    title: 'İletişim | YZL321 Store',
    description: 'Bizimle iletişime geçin. Sorularınızı ve geri bildirimlerinizi bekliyoruz.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-slate-900 pt-48 pb-32 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-6 text-center relative z-10 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-brand-400 text-sm font-bold mb-8 animate-fade-in">
                        <Sparkles size={16} />
                        <span>Sizin İçin Buradayız</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                        Bizimle İletişime Geçin
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız. Ekibimiz her türlü geri bildiriminize değer verir ve en kısa sürede dönüş yapar.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-6 -mt-16 pb-32 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:-translate-y-1 duration-300">
                            <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
                                <Mail size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">E-posta</h3>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">Projeleriniz ve sorularınız için bize yazın.</p>
                            <a href="mailto:iletisim@aliakpoyraz.com" className="text-brand-600 font-bold hover:text-brand-700 transition-colors text-lg">
                                iletisim@aliakpoyraz.com
                            </a>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:-translate-y-1 duration-300">
                            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Phone size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Telefon</h3>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">Hafta içi 09:00 - 18:00 arası bizi arayın.</p>
                            <a href="tel:+902120000000" className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-lg">
                                +90 (212) 000 00 00
                            </a>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:-translate-y-1 duration-300">
                            <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                                <MapPin size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Ofisimiz</h3>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">Bizi merkez ofisimizde ziyaret edin.</p>
                            <address className="text-slate-800 not-italic font-medium leading-relaxed">
                                Şişli, İstanbul / Türkiye
                            </address>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl -z-10 opacity-40 translate-x-1/3 -translate-y-1/3"></div>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="bg-slate-900 text-white p-3 rounded-2xl">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mesaj Gönderin</h2>
                                    <p className="text-slate-500 text-sm mt-1">Düşünceleriniz bizim için önemli.</p>
                                </div>
                            </div>

                            <ContactForm />
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
