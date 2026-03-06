"use client";

import { useState, useEffect } from 'react';
import { Star, MessageCircle, User, Check } from 'lucide-react';
import ReviewForm from './ReviewForm';

type Review = {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
        firstName: string | null;
        lastName: string | null;
    };
};

export default function ReviewsSection({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [existingReviewData, setExistingReviewData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/reviews`);
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Fetch reviews error:', error);
        }
    };

    const checkEligibility = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/can-review`);
            if (res.ok) {
                const data = await res.json();
                setCanReview(data.canReview);
                if (data.reason === 'ALREADY_REVIEWED') {
                    setExistingReviewData(data.review);
                }
            }
        } catch (error) {
            console.error('Check eligibility error:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([fetchReviews(), checkEligibility()]);
            setIsLoading(false);
        };
        init();
    }, [productId]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-100 rounded-full w-1/4"></div>
            <div className="h-40 bg-slate-50 rounded-[2rem]"></div>
        </div>;
    }

    return (
        <section className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageCircle className="text-blue-600" size={32} />
                        Müşteri Değerlendirmeleri
                    </h2>
                    <p className="text-slate-500 mt-2">Kullanıcılarımızın bu ürün hakkındaki deneyimleri.</p>
                </div>

                {averageRating && (
                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={20}
                                    fill={s <= Math.round(Number(averageRating)) ? "#facc15" : "transparent"}
                                    color={s <= Math.round(Number(averageRating)) ? "#facc15" : "#slate-300"}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">{averageRating}</span>
                            <span className="text-slate-400 text-sm font-medium">({reviews.length} Yorum)</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {reviews.length === 0 ? (
                        <div className="bg-slate-50 rounded-[2rem] p-12 text-center">
                            <Star className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">Henüz değerlendirme yapılmamış.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {review.user.firstName} {review.user.lastName}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={16}
                                                fill={s <= review.rating ? "#facc15" : "transparent"}
                                                color={s <= review.rating ? "#facc15" : "#e2e8f0"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    {canReview || isEditing ? (
                        <ReviewForm
                            productId={productId}
                            initialData={isEditing ? existingReviewData : undefined}
                            onSuccess={() => {
                                fetchReviews();
                                checkEligibility();
                                setIsEditing(false);
                            }}
                        />
                    ) : existingReviewData ? (
                        <div className="bg-green-50 border border-green-100 rounded-[2rem] p-8 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="text-green-600" size={24} />
                            </div>
                            <h4 className="font-bold text-green-900 mb-2">Değerlendirme Yaptınız</h4>
                            <p className="text-green-700 text-sm leading-relaxed mb-6">
                                Bu ürün için zaten bir değerlendirme bıraktınız. Dilerseniz mevcut değerlendirmenizi güncelleyebilirsiniz.
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
                            >
                                Değerlendirmeyi Düzenle
                            </button>
                        </div>
                    ) : (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 text-center">
                            <h4 className="font-bold text-blue-900 mb-2">Fikrinizi Paylaşın</h4>
                            <p className="text-blue-700 text-sm leading-relaxed mb-4">
                                Bu ürünü satın aldıysanız deneyimlerinizi paylaşarak diğer kullanıcılara yardımcı olabilirsiniz.
                            </p>
                            <p className="text-xs font-bold text-blue-500/60 uppercase tracking-widest">
                                Sadece Satın Alanlar
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
