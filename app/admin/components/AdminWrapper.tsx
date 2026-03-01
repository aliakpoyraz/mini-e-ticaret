"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAdminAuth');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            if (email === 'admin@store.com' && password === 'admin123') {
                localStorage.setItem('isAdminAuth', 'true');
                setIsAuthenticated(true);
            } else {
                setError('E-posta veya şifre hatalı.');
            }
        } catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 selection:bg-blue-100 selection:text-blue-900 font-sans">

                <div className="w-full max-w-[360px] mx-auto">

                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-xl font-bold tracking-tighter">A.</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-black mb-2">
                            Yönetici Girişi
                        </h1>
                        <p className="text-[14px] text-gray-500">
                            Devam etmek için hesap bilgilerinizi girin.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">

                        {error && (
                            <div className="p-3 bg-[#FFF3F3] text-[#D8000C] text-[13px] font-medium rounded-xl mb-4 text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/10 rounded-[14px] outline-none transition-all text-[15px] text-black placeholder:text-[#86868B]"
                                    placeholder="E-posta"
                                    autoComplete="email"
                                    spellCheck={false}
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/10 rounded-[14px] outline-none transition-all text-[15px] text-black placeholder:text-[#86868B]"
                                    placeholder="Şifre"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 py-3.5 bg-black hover:bg-gray-800 text-white rounded-full text-[15px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin text-white/70" />
                            ) : (
                                <span>Giriş Yap</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[12px] text-gray-400">
                            Demo: admin@store.com / admin123
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    return <>{children}</>;
}
