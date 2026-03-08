import React from 'react';

export const metadata = {
    title: 'İptal ve İade Koşulları',
    description: 'Satın aldığınız ürünlerin iptal ve iade süreçleri hakkında bilgiler.',
};

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-sm border border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">İptal ve İade Koşulları</h1>

                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
                        <p className="text-lg text-slate-600 mb-8">
                            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">1. İade Hakkı</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Alıcı, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 gün içinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">2. İade Süreci</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            İade edilecek ürünlerin orijinal ambalajında, kullanılmamış ve hasarsız olması gerekmektedir. İade işlemi için müşteri hizmetlerimizle iletişime geçerek bir iade talep numarası (RMA) almanız gerekmektedir. İade kargo bedeli, kusurlu ürünler dışında alıcıya aittir.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">3. İade Edilemeyen Ürünler</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Niteliği itibarıyla iade edilemeyecek tek kullanımlık ürünler, kopyalanabilir yazılım ve programlar, hızlı bozulan veya son kullanım tarihi geçme ihtimali olan ürünlerin iadesi kabul edilmemektedir. Hijyenik nedenlerle iç giyim ürünleri, mayo, bikini ve kozmetik ürünlerinin ambalajı açılmışsa iade edilemez.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">4. Para İadesi</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            İade edilen ürünler tarafımıza ulaşıp kalite kontrolünden geçtikten sonra, para iadesi işlemi başlatılır. İadenin kredi kartınıza/banka hesabınıza yansıması bankanızın işlem sürelerine bağlı olarak 3-7 iş günü sürebilir.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">5. Sipariş İptali</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Siparişiniz kargoya verilmeden önce iptal işlemi yapabilirsiniz. İptal taleplerinizi iletişim sayfamız üzerinden veya müşteri hizmetleri numaramızı arayarak bize iletebilirsiniz. Sipariş kargoya verilmişse, iade prosedürü uygulanmalıdır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
