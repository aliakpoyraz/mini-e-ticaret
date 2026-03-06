"use client";

import { useState, useEffect } from 'react';
import { Star, Check, X, Clock, MessageSquare, ExternalLink, Search, Filter } from 'lucide-react';
import Image from 'next/image';

type Review = {
    id: number;
    rating: number;
    comment: string | null;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    product: {
        name: string;
        imageUrl: string;
    };
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews || []);
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusUpdate = async (reviewId: number, status: string) => {
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, status })
            });

            if (res.ok) {
                setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: status as any } : r));
            }
        } catch (error) {
            console.error('Update status error:', error);
        }
    };

    const filteredReviews = reviews.filter(r => {
        const matchesFilter = filter === 'ALL' || r.status === filter;
        const matchesSearch = r.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="p-8 animate-pulse space-y-6">
                <div className="h-10 bg-slate-100 rounded-xl w-1/4"></div>
                <div className="h-64 bg-slate-50 rounded-[2rem]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={32} />
                        Değerlendirmeler
                    </h1>
                    <p className="text-slate-500 mt-1">Ürün yorumlarını ve müşteri deneyimlerini yönetin.</p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Ürün, kullanıcı veya yorumlarda ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${filter === f
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {f === 'ALL' && 'Hepsi'}
                                {f === 'PENDING' && 'Onay Bekleyenler'}
                                {f === 'APPROVED' && 'Onaylananlar'}
                                {f === 'REJECTED' && 'Reddedilenler'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-4">Ürün</th>
                                <th className="pb-4 px-4 text-center">Puan</th>
                                <th className="pb-4 px-4">Yorum</th>
                                <th className="pb-4 px-4">Kullanıcı</th>
                                <th className="pb-4 px-4">Tarih</th>
                                <th className="pb-4 px-4">Durum</th>
                                <th className="pb-4 px-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-slate-400 font-medium">
                                        Eşleşen değerlendirme bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                    {review.product.imageUrl ? (
                                                        <Image
                                                            src={review.product.imageUrl}
                                                            alt={review.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Star size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm max-w-[200px] line-clamp-2">
                                                    {review.product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center justify-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        size={14}
                                                        fill={s <= review.rating ? "#facc15" : "transparent"}
                                                        color={s <= review.rating ? "#facc15" : "#cbd5e1"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm text-slate-600 leading-relaxed italic line-clamp-3">
                                                    "{review.comment || 'Yorumsuz'}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-900">{review.user.firstName} {review.user.lastName}</p>
                                                <p className="text-slate-400">{review.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-500 font-medium">
                                                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset ${review.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                review.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                    'bg-red-50 text-red-700 ring-red-600/20'
                                                }`}>
                                                {review.status === 'APPROVED' && 'Onaylı'}
                                                {review.status === 'PENDING' && 'Beklemede'}
                                                {review.status === 'REJECTED' && 'Reddedildi'}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {review.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'APPROVED')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Onayla"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                {review.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'REJECTED')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        title="Reddet"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
