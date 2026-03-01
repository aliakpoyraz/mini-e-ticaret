"use client";

import React from 'react';
import AdminWrapper from './AdminWrapper';

export default function AdminLayoutWrapper({
    children,
    sidebar
}: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) {
    return (
        <AdminWrapper>
            <div className="min-h-screen bg-[#F5F5F7] flex text-slate-900 font-sans">
                {sidebar}
                <main className="flex-1 ml-64 min-h-screen transition-all duration-300">
                    <div className="p-10 max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AdminWrapper>
    );
}
