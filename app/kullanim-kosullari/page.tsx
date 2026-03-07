import React from 'react';

export const metadata = {
    title: 'Kullanım Koşulları',
    description: 'Hizmetlerimizi kullanırken tabi olduğunuz şartlar ve koşullar.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-sm border border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">Kullanım Koşulları</h1>

                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
                        <p className="text-lg text-slate-600 mb-8">
                            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">1. Kabul Edilme</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Bu web sitesine erişerek ve hizmetlerimizi kullanarak, bu Kullanım Koşulları'nı ve tüm geçerli yasaları ve düzenlemeleri kabul etmiş olursunuz. Bu koşullardan herhangi birine katılmıyorsanız, bu siteyi kullanmanız yasaktır.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">2. Kullanım Lisansı</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Sitedeki materyallerin (bilgi veya yazılım) geçici olarak yalnızca kişisel, ticari olmayan geçici görüntüleme için indirilmesine izin verilir. Bu, bir mülkiyet devri değil, sadece bir lisans verilmesidir.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">3. Sorumluluk Reddi</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Sitemizdeki materyaller "olduğu gibi" sağlanmaktadır. Satılabilirlik, belirli bir amaca uygunluk veya fikri mülkiyet haklarının ihlal edilmemesi de dahil olmak üzere, açık veya zımni hiçbir garanti vermemekteyiz.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">4. Sınırlamalar</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Hiçbir durumda biz veya tedarikçilerimiz, sitemizdeki materyallerin kullanımından veya kullanılamamasından doğacak zararlardan (veri veya kar kaybı dahil ancak bunlarla sınırlı olmamak üzere) sorumlu tutulamayız.
                        </p>

                        <h2 className="text-2xl mt-12 mb-4 text-slate-900">5. Satın Alma ve İadeler</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Sitemiz üzerinden yapılan tüm satın alma işlemleri iade politikamıza tabidir. Ürünlerin açıklamalarını, fiyatlandırmaları ve stok durumunu önceden bildirmeksizin değiştirme hakkımızı saklı tutarız.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
