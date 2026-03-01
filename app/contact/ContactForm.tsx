'use client';

import React from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
    return (
        <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Adınız Soyadınız</label>
                    <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Adınız Soyadınız"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">E-posta Adresiniz</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="ornek@email.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Konu</label>
                <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mesajınızın konusu"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-slate-700">Mesajınız</label>
                <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Size nasıl yardımcı olabiliriz?"
                ></textarea>
            </div>

            <button
                type="button"
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group"
                onClick={() => alert("Mesaj gönderme işlevi MVP aşamasındadır.")}
            >
                <span>Mesajı Gönder</span>
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
    );
}
