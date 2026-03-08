"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

export default function HeroSlider() {
    return (
        <div className="relative h-[700px] w-full bg-slate-50 flex items-center overflow-hidden pt-32 pb-32">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-100/50 skew-x-[-12deg] translate-x-32" />

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                <div className="space-y-6 md:space-y-8 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                        Rahatlığın <br className="hidden sm:block" /> Geleceği.
                    </h1>
                    <p className="text-xl text-slate-600 max-w-md leading-relaxed">
                        Yeni koleksiyonumuzu deneyimleyin. Birinci sınıf materyaller, minimalist tasarım ve rahatlığın kolaylığa bürünmüş hali.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link href="/urunler" className="group flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-slate-800 transition-all shadow-xl shadow-black/10 text-center">
                            Hemen Alışveriş Yap <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/urunler" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-slate-900 hover:bg-slate-200 transition-all text-center">
                            Daha Fazla Bilgi
                        </Link>
                    </div>
                </div>

                <div className="relative h-[500px] hidden md:block scale-95 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-white to-neutral-950 rounded-[5rem] shadow-2xl rotate-3 hover:rotate-2 transition-transform duration-600 flex items-center justify-center">
                        <span className="text-black font-bold text-9xl tracking-tighter opacity-90">
                            Quality
                        </span>
                    </div>
                </div>
            </div>
        </div >
    );
}
