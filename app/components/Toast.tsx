import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Solma animasyonunu bekle
            }, 3000); // 3 saniye göster
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show && !isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4">
            <div className={`
                flex items-center gap-3 px-5 py-3 
                bg-slate-900/95 backdrop-blur-xl text-white
                rounded-2xl shadow-2xl shadow-black/20 
                border border-white/10
                transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-8 opacity-0 scale-95'
                }
            `}>
                <CheckCircle2 size={20} className="text-emerald-400" />
                <p className="text-sm font-semibold tracking-wide pr-2">
                    {message}
                </p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={16} className="text-slate-400" />
                </button>
            </div>
        </div>
    );
}
