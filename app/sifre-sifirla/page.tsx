"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Geçersiz veya eksik bağlantı. Lütfen yeni bir sıfırlama talebinde bulunun.');
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/auth/reset-password?token=${token}`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Bu bağlantı geçersiz, süresi dolmuş veya daha önce kullanılmış.');
                }
            } catch (err) {
                setError('Bağlantı kontrol edilirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Şifreler uyuşmuyor.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/giris-yap');
                }, 3000);
            } else {
                const detailedError = data.details
                    ? `${data.error} - Detay: ${data.details}`
                    : (data.error || 'İşlem başarısız oldu.');
                setError(detailedError);
            }
        } catch (err) {
            setError('Sunucu hatası oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Şifreniz Güncellendi</h2>
                <p className="text-sm text-slate-500 mb-8 px-4">
                    Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                    Yeni Şifre Belirleyin
                </h1>
                <p className="text-sm text-slate-500">
                    Lütfen hesabınız için yeni ve güvenli bir şifre girin.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {!token ? (
                <button
                    onClick={() => router.push('/sifremi-unuttum')}
                    className="w-full py-3.5 bg-black text-white rounded-full text-sm font-semibold"
                >
                    Yeni Talep Oluştur
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            placeholder="Yeni şifre"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            placeholder="Şifreyi onayla"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password || !confirmPassword}
                        className="w-full mt-4 py-3.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <span>Şifreyi Güncelle</span>
                        )}
                    </button>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6 font-sans">
            <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
                <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
