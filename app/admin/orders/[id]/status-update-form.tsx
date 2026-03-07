"use client";

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface StatusUpdateFormProps {
    orderId: number;
    initialStatus: string;
    updateStatusAction: (formData: FormData) => Promise<void>;
}

export default function StatusUpdateForm({ orderId, initialStatus, updateStatusAction }: StatusUpdateFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSuccess(false);

        const formData = new FormData(e.currentTarget);
        try {
            await updateStatusAction(formData);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Güncelleme başarısız oldu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative">
                <select
                    name="status"
                    defaultValue={initialStatus}
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-black/5 focus:outline-none cursor-pointer font-medium appearance-none transition-all hover:border-slate-300"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                    <option value="CREATED">Oluşturuldu</option>
                    <option value="PAID">Ödendi</option>
                    <option value="SHIPPED">Kargolandı</option>
                    <option value="DELIVERED">Teslim Edildi</option>
                    <option value="RETURN_REQUESTED">İade Talep Edildi</option>
                    <option value="RETURNED">İade Edildi</option>
                    <option value="RETURN_REJECTED">İade Reddedildi</option>
                    <option value="CANCELLED">İptal Edildi</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${isSuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    } disabled:opacity-70`}
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isSuccess ? (
                    <><Check size={16} /> Tamam</>
                ) : (
                    'Güncelle'
                )}
            </button>
        </form>
    );
}
