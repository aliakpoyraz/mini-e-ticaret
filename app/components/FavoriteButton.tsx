"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoriteButton({
    productId,
    initialIsFavorite = false,
    className = ''
}: {
    productId: number,
    initialIsFavorite?: boolean,
    className?: string
}) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.isFavorite);
                router.refresh();
            } else {
                if (res.status === 401) {
                    alert("Favorilere eklemek için giriş yapmalısınız.");
                    router.push('/giris-yap');
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`p-2 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300 ${isFavorite ? 'bg-red-50 border-red-100' : 'bg-white/90 border-transparent'} border backdrop-blur-md ${className}`}
        >
            <Heart
                size={20}
                className={`transition-colors duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            />
        </button>
    );
}
