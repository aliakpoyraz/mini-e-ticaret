"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Dummy timeout for MVP presentation
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6 font-sans">
            <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
                {isSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Bağlantı Gönderildi</h2>
                        <p className="text-sm text-slate-500 mb-8 px-4">
                            Şifrenizi sıfırlamanız için <strong>{email}</strong> adresine bir bağlantı gönderdik. (Bu bir demo özelliğidir)
                        </p>
                        <Link href="/giris-yap" className="w-full py-3.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors block active:scale-[0.98]">
                            Giriş Ekranına Dön
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                                Şifrenizi mi Unuttunuz?
                            </h1>
                            <p className="text-sm text-slate-500">
                                E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full py-3.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <span>Bağlantı Gönder</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium">
                            <Link href="/giris-yap" className="text-blue-600 hover:text-blue-700 transition-colors">
                                Giriş sayfasına dön
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
