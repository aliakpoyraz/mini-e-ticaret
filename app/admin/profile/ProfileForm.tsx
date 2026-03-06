"use client";

import { useState } from 'react';
import { User as UserIcon, Mail, Lock, Shield, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProfileForm({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        oldPassword: '',
        password: '',
        passwordConfirm: ''
    });

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.password) {
            if (!formData.oldPassword) {
                setMessage({ type: 'error', text: 'Şifrenizi değiştirmek için lütfen eski şifrenizi girin.' });
                return;
            }
            if (formData.password !== formData.passwordConfirm) {
                setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
                return;
            }
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    oldPassword: formData.oldPassword || undefined,
                    password: formData.password || undefined
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
                setFormData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
                router.refresh();
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Bir hata oluştu.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Kişisel Bilgiler */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <UserIcon className="text-slate-400" size={20} />
                            Kişisel Bilgiler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ad</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Soyad</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Hesap Bilgileri */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Mail className="text-slate-400" size={20} />
                            İletişim & Giriş
                        </h2>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-posta Adresi</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Şifre Değiştirme */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="text-slate-400" size={20} />
                            Güvenlik
                        </h2>
                        <div className="space-y-2 max-w-sm">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Eski Şifre</label>
                            <input
                                type="password"
                                placeholder="Şifre değiştirmek için gereklidir"
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Yeni Şifre</label>
                                <input
                                    type="password"
                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        </form>
    );
}
