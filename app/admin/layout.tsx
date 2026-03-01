import AdminSidebar from './components/AdminSidebar';
import AdminLayoutWrapper from './components/AdminLayoutWrapper';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminLayoutWrapper sidebar={<AdminSidebar />}>
            {children}
        </AdminLayoutWrapper>
    );
}
