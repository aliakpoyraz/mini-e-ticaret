"use client";

import { useState } from 'react';
import { Search, Mail, Phone, Calendar, Shield, ShieldOff, Edit2, Key, Loader2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    isBanned: boolean;
    createdAt: Date;
    _count: {
        orders: number;
    };
}

export default function MembersTable({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
    const [resetLink, setResetLink] = useState<{ id: number, link: string } | null>(null);

    const router = useRouter();

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const s = search.toLowerCase();
        return fullName.includes(s) || email.includes(s);
    });

    const toggleBan = async (userId: number, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBanned: !currentStatus })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    const generateResetLink = (userId: number) => {
        // In a real app, this would be a secure token link. 
        // For MVP, we'll generate a dummy link to show the feature.
        const origin = window.location.origin;
        const link = `${origin}/reset-password?userId=${userId}&token=${Math.random().toString(36).substring(7)}`;
        setResetLink({ id: userId, link });
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Üye ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Üye</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">İletişim</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Siparişler</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Kayıt Tarihi</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Durum</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group ${user.isBanned ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                {(user.firstName || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {user.firstName} {user.lastName}
                                                    {user.role === 'ADMIN' && <span className="ml-2 text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-md font-bold uppercase">Admin</span>}
                                                </div>
                                                <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Mail size={12} className="text-slate-400" />
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="font-bold text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded-lg">
                                            {user._count.orders}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-slate-600 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {user.isBanned ? (
                                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-full uppercase tracking-wider">Yasaklı</span>
                                        ) : (
                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-wider">Aktif</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => generateResetLink(user.id)}
                                                title="Şifre Sıfırlama Bağlantısı Gönder"
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleBan(user.id, user.isBanned)}
                                                disabled={loadingMap[user.id] || user.role === 'ADMIN'}
                                                title={user.isBanned ? "Yasağı Kaldır" : "Sistemi Yasakla"}
                                                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${user.isBanned ? 'text-emerald-500' : 'text-red-500'} disabled:opacity-30`}
                                            >
                                                {loadingMap[user.id] ? <Loader2 size={18} className="animate-spin" /> : (user.isBanned ? <Shield size={18} /> : <ShieldOff size={18} />)}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Link Modal */}
            {resetLink && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setResetLink(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100">
                            <X size={20} />
                        </button>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6">
                            <Key size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Şifre Sıfırlama Bağlantısı</h3>
                        <p className="text-sm text-slate-500 mb-6">Aşağıdaki bağlantıyı manuel olarak üyeye gönderebilirsiniz:</p>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 break-all text-xs font-mono text-slate-600 mb-6">
                            {resetLink.link}
                        </div>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(resetLink.link);
                                // could add a toast here
                            }}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            Bağlantıyı Kopyala
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
