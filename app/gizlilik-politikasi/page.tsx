import React from 'react';

export const metadata = {
    title: 'Gizlilik Politikası',
    description: 'Gizlilik Politikamız hakkında bilgi edinin.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center pt-40 pb-12 px-6 font-sans">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-sm border border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">Gizlilik Politikası</h1>

                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
                        <p className="text-lg text-slate-600 mb-8">
                            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">1. Topladığımız Bilgiler</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Hizmetlerimizi kullandığınızda size daha iyi bir deneyim sunabilmek için çeşitli bilgiler topluyoruz. Bu bilgiler arasında adınız, e-posta adresiniz, teslimat adresiniz, ödeme bilgileriniz ve sitemizi nasıl kullandığınıza dair teknik veriler yer alabilir.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">2. Bilgilerin Kullanımı</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Topladığımız bilgileri siparişlerinizi işlemek, size müşteri desteği sağlamak, hizmetlerimizi iyileştirmek ve size özel kampanya ve bildirimler sunmak amacıyla kullanmaktayız. Kişisel bilgilerinizi asla izniniz olmadan üçüncü şahıslara satmıyoruz.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">3. Çerezler (Cookies)</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Sitemizdeki deneyiminizi kişiselleştirmek ve trafiğimizi analiz etmek için çerezler kullanıyoruz. Çerez tercihlerinizi tarayıcı ayarlarınızdan dilediğiniz zaman değiştirebilirsiniz.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">4. Veri Güvenliği</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Kişisel verilerinizin güvenliği bizim için son derece önemlidir. Verilerinizi yetkisiz erişime, değiştirilmeye veya silinmeye karşı korumak için sektör standardı güvenlik önlemlerini sürekli güncelliyoruz.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">5. İletişim</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Gizlilik politikamızla ilgili herhangi bir sorunuz varsa, lütfen bizimle <strong>iletisim@ornek.com</strong> adresi üzerinden iletişime geçmekten çekinmeyin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
