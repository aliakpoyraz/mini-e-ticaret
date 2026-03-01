import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { createCoupon } from '../actions';

export default function NewCouponPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/discounts"
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Yeni Kupon</h1>
                    <p className="text-sm text-slate-500">Müşterilerinize özel promosyon kodları oluşturun.</p>
                </div>
            </div>

            <form action={createCoupon} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Temel Bilgiler</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Kupon Kodu</label>
                            <input name="code" type="text" required placeholder="Örn: YAZ50" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm uppercase font-mono tracking-wider" />
                            <p className="text-xs text-slate-500 mt-1">Müşterilerin alışveriş sırasında gireceği kod. Otomatik büyük harfe çevrilir.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">İndirim Türü</label>
                                <select name="type" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm appearance-none cursor-pointer" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
                                    <option value="PERCENTAGE">Yüzdelik (%)</option>
                                    <option value="FIXED">Sabit Tutar (₺)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">İndirim Değeri</label>
                                <input name="value" type="number" step="0.01" required placeholder="0.00" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Kullanım Kuralları</h2>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">Minimum Sepet Tutarı (₺)</label>
                                <input name="minCartValue" type="number" step="0.01" placeholder="0.00" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm" />
                                <p className="text-xs text-slate-500 mt-1">Belirtilmezse tüm sepetlerde geçerli olur.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">Kullanım Sınırı</label>
                                <input name="usageLimit" type="number" step="1" placeholder="Limitsiz" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm" />
                                <p className="text-xs text-slate-500 mt-1">Toplam kullanılabilecek sefer adedi.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="active" defaultChecked className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer" />
                        <div>
                            <span className="block text-sm font-bold text-slate-900">Aktif</span>
                            <span className="block text-xs text-slate-500 mt-0.5">Bu kupon şu an kullanılabilir durumda.</span>
                        </div>
                    </label>
                </div>

                <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <Save size={18} /> Kuponu Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
