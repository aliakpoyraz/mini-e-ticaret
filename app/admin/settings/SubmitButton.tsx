"use client";

import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

export function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow group disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Save size={18} className={`text-white transition-transform ${pending ? 'animate-pulse' : 'group-hover:scale-110'}`} />
            {pending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
    );
}
