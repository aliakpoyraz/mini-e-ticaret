"use client";

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';

type ReviewFormProps = {
    productId: number;
    initialData?: {
        rating: number;
        comment: string | null;
    };
    onSuccess: () => void;
};

export default function ReviewForm({ productId, initialData, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(initialData?.rating || 5);
    const [comment, setComment] = useState(initialData?.comment || '');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Yorum gönderilemedi');

            setMessage({
                type: 'success',
                text: data.message || (initialData
                    ? 'Değerlendirmeniz başarıyla güncellendi.'
                    : 'Değerlendirmeniz için teşekkürler! Değerlendirmeniz yayınlandı.')
            });
            if (!initialData) setComment('');
            onSuccess();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-[2rem] p-8 space-y-6">
            <h4 className="text-xl font-bold text-slate-900">
                {initialData ? 'Değerlendirmeyi Düzenle' : 'Değerlendirme Yap'}
            </h4>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Puanınız</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={32}
                                fill={star <= (hoveredRating || rating) ? "#facc15" : "transparent"}
                                color={star <= (hoveredRating || rating) ? "#facc15" : "#cbd5e1"}
                                className="transition-colors"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Yorumunuz (İsteğe bağlı)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium min-h-[120px] resize-none"
                />
            </div>

            {message && (
                <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'} animate-fade-in`}>
                    {message.text}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Send size={18} />
                )}
                {initialData ? 'Değerlendirmeyi Güncelle' : 'Değerlendirmeyi Gönder'}
            </button>
        </form>
    );
}
