import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex text-slate-900 font-sans overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 ml-64 min-h-screen transition-all duration-300 min-w-0">
                <div className="p-10 max-w-[1400px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
