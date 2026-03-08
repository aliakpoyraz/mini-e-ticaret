"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginForm() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [resendStatus, setResendStatus] = useState<{ loading: boolean, message: string }>({ loading: false, message: '' });
    const router = useRouter();

    useEffect(() => {
        const verified = searchParams.get('verified');
        const err = searchParams.get('error');

        if (verified === 'true') {
            setSuccessMessage('E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.');
        }

        if (err) {
            setError(decodeURIComponent(err));
        }
    }, [searchParams]);

    const handleResendVerification = async () => {
        setResendStatus({ loading: true, message: '' });
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setResendStatus({ loading: false, message: 'Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.' });
            } else {
                setResendStatus({ loading: false, message: data.error || 'Gönderilemedi.' });
            }
        } catch (err) {
            setResendStatus({ loading: false, message: 'Bir hata oluştu.' });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResendStatus({ loading: false, message: '' });
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/');
                    router.refresh();
                }, 1000);
            } else {
                setError(data.error || 'Giriş yapılamadı.');
            }
        } catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6 font-sans">
            <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                        {isSuccess ? 'Giriş Başarılı!' : 'Tekrar Hoş Geldiniz'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isSuccess ? 'Yönlendiriliyorsunuz...' : 'Hesabınıza giriş yapın ve alışverişe devam edin.'}
                    </p>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <div className="space-y-3">
                                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center">
                                    {error}
                                </div>
                                {error.includes('doğrulayın') && (
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendVerification}
                                            disabled={resendStatus.loading}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                                        >
                                            {resendStatus.loading ? 'Gönderiliyor...' : 'Doğrulama e-postasını tekrar gönder'}
                                        </button>
                                        {resendStatus.message && (
                                            <p className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                                                {resendStatus.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {successMessage && !isSuccess && (
                            <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-xl text-center flex items-center justify-center gap-2 mb-4">
                                <CheckCircle2 size={16} />
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                        placeholder="E-posta adresi"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                        placeholder="Şifre"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Link href="/sifremi-unuttum" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                    Şifremi Unuttum
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 py-3.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <span>Giriş Yap</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-slate-500">
                    Hesabınız yok mu?{' '}
                    <Link href="/kayit-ol" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        Kayıt Olun
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
