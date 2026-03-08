"use client";

import { useActionState, useEffect, useState } from 'react';
import { Save, Store, AlignLeft, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { updateSettings } from './actions';
import { SubmitButton } from './SubmitButton';
import { StoreSettings } from '@prisma/client';
import { Toast } from '../../components/Toast';

export function SettingsForm({ settings }: { settings: StoreSettings }) {
    const [state, formAction] = useActionState(updateSettings, null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setShowToast(true);
        }
    }, [state]);

    return (
        <>
            <form action={formAction} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-8">

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Store className="text-slate-400" size={20} />
                            Genel Bilgiler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mağaza Adı</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="storeName"
                                        defaultValue={settings.storeName}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow"
                                        placeholder="Örn. Harika Mağazam"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Varsayılan Para Birimi</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="currency"
                                        defaultValue={settings.currency}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow"
                                        placeholder="e.g. USD, EUR, TRY"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mağaza Açıklaması</label>
                            <div className="relative flex">
                                <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                                <textarea
                                    name="description"
                                    defaultValue={settings.description || ''}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow resize-y"
                                    placeholder="SEO ve alt bilgi için mağazanızın kısa açıklaması..."
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlignLeft className="text-slate-400" size={20} />
                            Duyuru Ayarları
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <input
                                    type="checkbox"
                                    name="isAnnouncementActive"
                                    id="isAnnouncementActive"
                                    defaultChecked={settings.isAnnouncementActive}
                                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <label htmlFor="isAnnouncementActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                                    Duyuru Bandını Aktif Et
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Duyuru Metni</label>
                                <div className="relative flex">
                                    <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <textarea
                                        name="announcement"
                                        defaultValue={settings.announcement || ''}
                                        rows={2}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow resize-y"
                                        placeholder="Örn. Mağazamıza hoş geldiniz! Bugün tüm kargolar ücretsiz."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Mail className="text-slate-400" size={20} />
                            İletişim Bilgileri
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Destek E-postası</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={settings.email || ''}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow"
                                        placeholder="support@store.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Telefon Numarası</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        defaultValue={settings.phone || ''}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Fiziksel Adres</label>
                            <div className="relative flex">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <textarea
                                    name="address"
                                    defaultValue={settings.address || ''}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm transition-shadow resize-y"
                                    placeholder="Mağazanızın fiziksel konumu veya merkez adresi..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        İptal
                    </button>
                    <SubmitButton />
                </div>
            </form>

            <Toast
                show={showToast}
                message="Ayarlar başarıyla kaydedildi."
                onClose={() => setShowToast(false)}
            />
        </>
    );
}
