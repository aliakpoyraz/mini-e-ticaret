"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Image {
    url: string;
    order: number;
}

interface ProductImageGalleryProps {
    mainImageUrl: string | null;
    images: Image[];
    productName: string;
    badge?: React.ReactNode;
    topRight?: React.ReactNode;
}

export default function ProductImageGallery({ mainImageUrl, images, productName, badge, topRight }: ProductImageGalleryProps) {
    // Combine main imageUrl + extra images into one ordered list
    const allImages: string[] = [];
    if (mainImageUrl) allImages.push(mainImageUrl);
    // Add extra images that are NOT the same as the main image
    const sortedExtras = [...images].sort((a, b) => a.order - b.order);
    for (const img of sortedExtras) {
        if (img.url !== mainImageUrl) allImages.push(img.url);
    }

    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent(i => (i - 1 + allImages.length) % allImages.length);
    const next = () => setCurrent(i => (i + 1) % allImages.length);

    if (allImages.length === 0) {
        return (
            <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden relative shadow-inner flex items-center justify-center text-gray-300 font-bold text-xl uppercase tracking-widest">
                Resim Yok
                {badge && <div className="absolute top-6 left-6 z-10">{badge}</div>}
                {topRight && <div className="absolute top-6 right-6 z-20">{topRight}</div>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main viewer */}
            <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden relative shadow-inner group">
                <img
                    key={current}
                    src={allImages[current]}
                    alt={`${productName} - ${current + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
                {badge && <div className="absolute top-6 left-6 z-10">{badge}</div>}
                {topRight && <div className="absolute top-6 right-6 z-20">{topRight}</div>}

                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails — only show if >1 image */}
            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
                    {allImages.map((url, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-none w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start ${i === current ? 'border-slate-900 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={url} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
