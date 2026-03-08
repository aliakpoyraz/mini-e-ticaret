"use client";

import React from 'react';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { Home, ExternalLink, QrCode } from 'lucide-react';

export default function QRPage() {
    const siteUrl = "https://e-ticaret.aliakpoyraz.com";

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center pt-32 pb-12 p-6 text-center font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <QrCode size={32} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                    Projeyi Keşfedin
                </h1>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">
                    Kameranızı okutarak projeyi canlı olarak telefonunuzdan inceleyebilirsiniz.
                </p>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner flex justify-center mb-10 mx-auto w-fit">
                    <QRCode
                        value={siteUrl}
                        size={220}
                        bgColor="transparent"
                        fgColor="#0f172a"
                        level="Q"
                    />
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                    >
                        <Home size={18} /> Ana Sayfaya Git
                    </Link>

                    <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <ExternalLink size={18} /> Tarayıcıda Aç
                    </a>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 font-medium">YZL321 Store | Mini E-Ticaret MVP</p>
                <div className="mt-2 text-[10px] text-slate-300">Gizli Sunum Linki</div>
            </div>
        </div>
    );
}
