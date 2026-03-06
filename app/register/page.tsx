"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";

const INPUT_CLASS = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400";
const INPUT_ERROR_CLASS = "w-full px-4 py-3.5 bg-red-50 border border-red-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-2xl outline-none transition-all text-sm text-slate-900 placeholder:text-red-300";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [captchaToken, setCaptchaToken] = useState('');

    const router = useRouter();

    // Only allow digits, strip leading zero
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, ''); // digits only
        // Strip leading zero if user types one
        const cleaned = raw.startsWith('0') ? raw.slice(1) : raw;
        setPhone(cleaned.slice(0, 10)); // max 10 digits
        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (firstName.trim().length < 2) errors.firstName = 'Ad en az 2 karakter olmalıdır.';
        if (lastName.trim().length < 2) errors.lastName = 'Soyad en az 2 karakter olmalıdır.';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) errors.email = 'Geçerli bir e-posta adresi girin.';

        // Phone: exactly 10 digits, must start with 5 (Turkish mobile)
        if (!/^5\d{9}$/.test(phone)) errors.phone = 'Telefon numarası 10 haneli olmalı ve 5 ile başlamalıdır (ör: 5321234567).';

        if (password.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır.';
        if (password !== passwordConfirm) errors.passwordConfirm = 'Şifreler eşleşmiyor.';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        if (!captchaToken) {
            setError('Lütfen robot olmadığınızı doğrulayın.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password, phone: `0${phone}`, captchaToken })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Kayıt işlemi başarısız.');
            }
        } catch (err) {
            setError('Kayıt olurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center py-12 px-6 font-sans">
            <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                        Hesap Oluşturun
                    </h1>
                    <p className="text-sm text-slate-500">
                        Hemen kayıt olun ve alışverişe başlayın.
                    </p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        {/* Ad & Soyad */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full">
                                <input
                                    type="text"
                                    required
                                    minLength={2}
                                    value={firstName}
                                    onChange={(e) => { setFirstName(e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')); if (fieldErrors.firstName) setFieldErrors(p => ({ ...p, firstName: '' })); }}
                                    className={fieldErrors.firstName ? INPUT_ERROR_CLASS : INPUT_CLASS}
                                    placeholder="Ad"
                                />
                                {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.firstName}</p>}
                            </div>
                            <div className="w-full">
                                <input
                                    type="text"
                                    required
                                    minLength={2}
                                    value={lastName}
                                    onChange={(e) => { setLastName(e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')); if (fieldErrors.lastName) setFieldErrors(p => ({ ...p, lastName: '' })); }}
                                    className={fieldErrors.lastName ? INPUT_ERROR_CLASS : INPUT_CLASS}
                                    placeholder="Soyad"
                                />
                                {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.lastName}</p>}
                            </div>
                        </div>

                        {/* Telefon */}
                        <div>
                            <div className={`flex items-center gap-0 ${fieldErrors.phone ? 'border border-red-400 rounded-2xl bg-red-50' : 'border border-slate-200 rounded-2xl bg-slate-50'} focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 transition-all`}>
                                <span className="pl-4 pr-2 text-sm font-semibold text-slate-500 whitespace-nowrap select-none">+90</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    required
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="flex-1 px-2 py-3.5 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 rounded-r-2xl"
                                    placeholder="5321234567"
                                    maxLength={10}
                                />
                            </div>
                            {fieldErrors.phone
                                ? <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.phone}</p>
                                : <p className="text-xs text-slate-400 mt-1 pl-1">Başında sıfır olmadan 10 haneli girin (ör: 5321234567)</p>
                            }
                        </div>

                        {/* E-posta */}
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }}
                                className={fieldErrors.email ? INPUT_ERROR_CLASS : INPUT_CLASS}
                                placeholder="E-posta adresi"
                            />
                            {fieldErrors.email && <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.email}</p>}
                        </div>

                        {/* Şifre */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full">
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })); }}
                                    className={fieldErrors.password ? INPUT_ERROR_CLASS : INPUT_CLASS}
                                    placeholder="Şifre"
                                />
                                {fieldErrors.password && <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.password}</p>}
                            </div>
                            <div className="w-full">
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={passwordConfirm}
                                    onChange={(e) => { setPasswordConfirm(e.target.value); if (fieldErrors.passwordConfirm) setFieldErrors(p => ({ ...p, passwordConfirm: '' })); }}
                                    className={fieldErrors.passwordConfirm ? INPUT_ERROR_CLASS : INPUT_CLASS}
                                    placeholder="Şifre (Tekrar)"
                                />
                                {fieldErrors.passwordConfirm && <p className="text-xs text-red-500 mt-1 pl-1">{fieldErrors.passwordConfirm}</p>}
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                onChange={(value) => setCaptchaToken(value || '')}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 py-3.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <span>Kayıt Ol</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Zaten hesabınız var mı?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        Giriş Yapın
                    </Link>
                </div>
            </div>
        </div>
    );
}
