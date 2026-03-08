import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = {
    title: 'İletişim',
    description: 'Bizimle iletişime geçin. Sorularınızı ve geri bildirimlerinizi bekliyoruz.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-24">
            <section className="bg-slate-50 pt-40 pb-24 border-b border-slate-100">
                <div className="container mx-auto px-6 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Bizimle İletişime Geçin</h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız. Ekibimiz en kısa sürede size dönüş yapacaktır.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">

                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">İletişim Bilgilerimiz</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">E-posta</h3>
                                        <p className="text-slate-500 mb-2">Genel sorularınız için e-posta gönderebilirsiniz.</p>
                                        <a href="mailto:destek@ornek.com" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">destek@ornek.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">Telefon</h3>
                                        <p className="text-slate-500 mb-2">Hafta içi 09:00 - 18:00 saatleri arasında arayabilirsiniz.</p>
                                        <a href="tel:+902120000000" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">+90 (212) 000 00 00</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">Ofis</h3>
                                        <p className="text-slate-500 mb-2">Merkez ofisimizi ziyaret edebilirsiniz.</p>
                                        <address className="text-slate-600 not-italic leading-relaxed">
                                            Örnek Mahallesi, Teknoloji Sokak<br />
                                            No: 42, İç Kapı: 1<br />
                                            Şişli, İstanbul
                                        </address>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>

                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Mesaj Gönderin</h2>

                        <ContactForm />
                    </div>

                </div>
            </section>
        </div>
    );
}
