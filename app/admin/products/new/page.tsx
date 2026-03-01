"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
    const router = useRouter();
    const [variants, setVariants] = useState([{ name: '', sku: '', stock: 0 }]);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const addVariant = () => {
        setVariants([...variants, { name: '', sku: '', stock: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

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
                setImageUrl(data.url);
            }
        } catch (error) {
            console.error(error);
            alert("Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price') as string),
            imageUrl: imageUrl,
            variants: variants
        };

        const res = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        } else {
            const data = await res.json();
            alert(data.error || 'Ürün oluşturulurken hata');
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni Ürün Ekle</h1>
                    <p className="text-gray-500 text-sm">Varyantları olan yeni bir ürün listesi oluşturun.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Temel Bilgiler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Ürün Adı</label>
                            <input name="name" required placeholder="Örn. Premium Pamuklu Tişört" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 text-sm placeholder:text-gray-400" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Açıklama</label>
                            <textarea name="description" required placeholder="Ürününüzü açıklayın..." className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none h-24 transition bg-white text-gray-900 resize-none text-sm placeholder:text-gray-400" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Fiyat (₺)</label>
                            <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-white text-gray-900 font-mono text-sm placeholder:text-gray-400" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Ürün Görseli</label>
                            <div className="flex items-center gap-3">
                                <label className={`flex-1 cursor-pointer bg-gray-50 border-2 border-dashed ${imageUrl ? 'border-brand-300 bg-brand-50' : 'border-gray-200'} rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition h-[42px]`}>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Upload size={16} />
                                        <span className="text-xs font-medium">{uploading ? 'Yükleniyor...' : imageUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}</span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                                </label>
                                {imageUrl && (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm shrink-0">
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <h2 className="text-lg font-bold text-gray-900">Varyantlar ve Stok</h2>
                        <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs text-brand-600 font-bold hover:bg-brand-50 px-2 py-1 rounded transition">
                            <Plus size={14} /> Varyant Ekle
                        </button>
                    </div>

                    <div className="space-y-2">
                        {variants.map((variant, index) => (
                            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Varyant Adı</label>
                                    <input
                                        placeholder="Örn. Küçük / Kırmızı"
                                        value={variant.name}
                                        onChange={e => {
                                            const newVariants = [...variants];
                                            newVariants[index].name = e.target.value;
                                            setVariants(newVariants);
                                        }}
                                        className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-none focus:border-brand-500 bg-white text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">SKU (Stok Kodu)</label>
                                    <input
                                        placeholder="Benzersiz Kod"
                                        value={variant.sku}
                                        onChange={e => {
                                            const newVariants = [...variants];
                                            newVariants[index].sku = e.target.value;
                                            setVariants(newVariants);
                                        }}
                                        className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-none focus:border-brand-500 bg-white text-gray-900 font-mono placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="w-20">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Stok</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={variant.stock}
                                        onChange={e => {
                                            const newVariants = [...variants];
                                            newVariants[index].stock = parseInt(e.target.value);
                                            setVariants(newVariants);
                                        }}
                                        className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-none focus:border-brand-500 bg-white text-gray-900"
                                    />
                                </div>
                                {variants.length > 1 && (
                                    <button type="button" onClick={() => removeVariant(index)} className="mt-5 text-gray-400 hover:text-red-500 transition">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold text-base hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5">
                        Ürün Oluştur
                    </button>
                </div>
            </form>
        </div>
    );
}
