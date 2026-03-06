"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, Plus, MapPin, Trash2, Edit2, CheckCircle2, Star } from 'lucide-react';

interface Address {
    id: number;
    title: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        address: '',
        city: '',
        country: 'Türkiye',
        zipCode: '',
        isDefault: false
    });

    const fetchAddresses = () => {
        fetch('/api/user/addresses')
            .then(res => res.json())
            .then(data => {
                if (data.addresses) setAddresses(data.addresses);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEdit = (addr: Address) => {
        setFormData({
            title: addr.title,
            address: addr.address,
            city: addr.city,
            country: addr.country,
            zipCode: addr.zipCode || '',
            isDefault: addr.isDefault
        });
        setEditId(addr.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

        try {
            await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' });
            fetchAddresses();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await fetch('/api/user/addresses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isDefault: true })
            });
            fetchAddresses();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { id: editId, ...formData } : formData;

            const res = await fetch('/api/user/addresses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowForm(false);
                setEditId(null);
                setFormData({ title: '', address: '', city: '', country: 'Türkiye', zipCode: '', isDefault: false });
                fetchAddresses();
            } else {
                alert('Adres kaydedilirken bir hata oluştu.');
            }
        } catch (error) {
            alert('Adres kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Adreslerim</h1>
                    <p className="text-slate-500">Teslimat & fatura adreslerinizi yönetin.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({ title: '', address: '', city: '', country: 'Türkiye', zipCode: '', isDefault: false });
                            setShowForm(true);
                        }}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Yeni Adres Ekle
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{editId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Adres Başlığı (Örn: Evim)</label>
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-brand-500 rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="hidden md:block"></div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Açık Adres</label>
                                <textarea
                                    required
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-brand-500 rounded-xl outline-none transition-all text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Şehir / İlçe</label>
                                <input
                                    required
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-brand-500 rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Ülke</label>
                                <input
                                    required
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-brand-500 rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Posta Kodu (İsteğe bağlı)</label>
                                <input
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-brand-500 rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                    className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 transition-colors"
                                />
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Bunu varsayılan adresim yap</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditId(null);
                                }}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {!showForm && addresses.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Kayıtlı adresiniz bulunmuyor.</p>
                </div>
            )}

            {!showForm && addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className={`p-6 rounded-2xl border transition-all ${addr.isDefault ? 'border-brand-200 bg-brand-50/30 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    {addr.title}
                                    {addr.isDefault && (
                                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md">
                                            <Star size={10} className="fill-brand-700" />
                                            Varsayılan
                                        </span>
                                    )}
                                </h4>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleEdit(addr)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Düzenle">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Sil">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p className="line-clamp-2">{addr.address}</p>
                                <p className="font-medium">{addr.city}, {addr.country}</p>
                                {addr.zipCode && <p className="text-slate-400">{addr.zipCode}</p>}
                            </div>
                            {!addr.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="mt-4 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                                >
                                    Varsayılan Yap
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
