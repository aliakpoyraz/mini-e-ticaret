import { prisma } from '@/lib/prisma';
import MembersTable from './components/MembersTable';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage() {
    // Get all users with their orders count
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users size={32} className="text-slate-400" />
                        Üyeler
                    </h1>
                    <p className="text-slate-500 mt-1">Sistemdeki tüm kayıtlı kullanıcıları yönetin.</p>
                </div>
            </div>

            <MembersTable initialUsers={users} />
        </div>
    );
}
