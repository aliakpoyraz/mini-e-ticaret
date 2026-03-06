import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/admin-login');
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(session.userId) }
    });

    if (!user) {
        redirect('/admin-login');
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profil & Güvenlik</h1>
                <p className="text-slate-500 mt-1">Yönetici hesap bilgilerinizi ve şifrenizi güncelleyin.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
