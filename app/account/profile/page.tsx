"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setFormData(prev => ({
                        ...prev,
                        firstName: data.user.firstName || '',
                        lastName: data.user.lastName || '',
                        phone: data.user.phone || '',
                        email: data.user.email || '',
                    }));
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (formData.newPassword || formData.currentPassword) {
            if (formData.newPassword !== formData.confirmNewPassword) {
                setMessage({ text: 'Yeni şifreler eşleşmiyor.', type: 'error' });
                return;
            }
            if (!formData.currentPassword) {
                setMessage({ text: 'Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz.', type: 'error' });
                return;
            }
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ text: data.error || 'Bir hata oluştu', type: 'error' });
            } else {
                setMessage({ text: 'Profiliniz başarıyla güncellendi.', type: 'success' });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
            }
        } catch (error) {
            setMessage({ text: 'Bir hata oluştu.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in relative overflow-hidden">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Profil Bilgileri</h1>
            <p className="text-slate-500 mb-8">Kişisel bilgilerinizi ve şifrenizi buradan yönetebilirsiniz.</p>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium animate-fade-in ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                    }`}>
                    {message.type === 'success' && <CheckCircle2 size={18} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
                {/* Kişisel Bilgiler */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Ad</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Soyad</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">E-posta</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Telefon Numarası</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Şifre Değiştirme */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Şifre Değiştirme <span className="text-xs font-normal text-slate-400 ml-2">(İsteğe bağlı)</span></h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Mevcut Şifreniz</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Yeni Şifre</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl outline-none transition-all text-sm text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader2 size={18} className="animate-spin" />}
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
