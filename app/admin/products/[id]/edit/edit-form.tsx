"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

type Variant = {
    id: number;
    name: string;
    sku: string;
    stock: number;
    order: number;
};

type ProductImage = {
    id: number;
    url: string;
    order: number;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: number | any;
    imageUrl: string | null;
    images?: ProductImage[];
    variants: Variant[];
};

export default function EditProductForm({ product }: { product: Product }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    // Initialize imageUrls from images relation, fallback to imageUrl
    const initialImages = product.images && product.images.length > 0
        ? product.images.map(img => img.url)
        : (product.imageUrl ? [product.imageUrl] : []);

    const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
    const [variants, setVariants] = useState(product.variants);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setImageUrls([...imageUrls, data.url]);
            }
        } catch (error) {
            console.error(error);
            alert("Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price') as string),
            imageUrls: imageUrls,
            variants: variants
        };

        const res = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        } else {
            alert('Ürün güncellenirken hata oluştu');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Ürün Detayları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Ürün Adı</label>
                        <input name="name" defaultValue={product.name} required className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Açıklama</label>
                        <textarea name="description" defaultValue={product.description || ''} required className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none h-24 transition bg-white text-gray-900 resize-none text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Fiyat (₺)</label>
                        <input name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 font-mono text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Ürün Görselleri</label>
                        <div className="flex flex-wrap items-center gap-3">
                            {imageUrls.map((url, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 shadow-sm shrink-0 group">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            <label className={`cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition h-16 px-4 w-auto`}>
                                <div className="flex flex-col items-center text-gray-500">
                                    <Upload size={16} />
                                    <span className="text-[10px] font-medium mt-1">{uploading ? 'Yükleniyor...' : 'Ekle'}</span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Envanter Yönetimi</h2>
                <div className="space-y-2">
                    {variants.sort((a, b) => (a.order || 0) - (b.order || 0)).map((variant, index) => (
                        <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (index === 0) return;
                                        const newVariants = [...variants];
                                        const tempOrder = newVariants[index].order;
                                        newVariants[index].order = newVariants[index - 1].order;
                                        newVariants[index - 1].order = tempOrder;
                                        setVariants(newVariants);
                                    }}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-brand-600 disabled:opacity-30"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (index === variants.length - 1) return;
                                        const newVariants = [...variants];
                                        const tempOrder = newVariants[index].order;
                                        newVariants[index].order = newVariants[index + 1].order;
                                        newVariants[index + 1].order = tempOrder;
                                        setVariants(newVariants);
                                    }}
                                    disabled={index === variants.length - 1}
                                    className="p-1 text-gray-400 hover:text-brand-600 disabled:opacity-30"
                                >
                                    <ArrowDown size={14} />
                                </button>
                            </div>
                            <div className="w-1/3">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Varyant Adı</label>
                                <input
                                    type="text"
                                    value={variant.name}
                                    onChange={e => {
                                        const newVariants = [...variants];
                                        newVariants[index].name = e.target.value;
                                        setVariants(newVariants);
                                    }}
                                    className="w-full border border-gray-200 p-1.5 rounded text-sm font-bold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white text-gray-900"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">SKU (Stok Kodu)</label>
                                <p className="font-mono text-xs text-gray-900 bg-white p-2 rounded border border-gray-200">{variant.sku}</p>
                            </div>
                            <div className="w-20">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Stok</label>
                                <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={e => {
                                        const newVariants = [...variants];
                                        newVariants[index].stock = parseInt(e.target.value) || 0;
                                        setVariants(newVariants);
                                    }}
                                    className="w-full border border-gray-200 p-1.5 rounded text-sm font-bold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold text-base hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5">
                    Ürünü Güncelle
                </button>
            </div>
        </form>
    );
}
