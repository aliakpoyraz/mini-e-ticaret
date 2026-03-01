import { prisma } from '@/lib/prisma';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    let settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
        settings = await prisma.storeSettings.create({
            data: { id: 1, storeName: 'My Store', currency: 'USD' }
        });
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mağaza Ayarları</h1>
                    <p className="text-slate-500 mt-1">Web sitenizin genel bilgilerini ve tercihlerini yönetin.</p>
                </div>
            </div>

            <SettingsForm settings={settings} />
        </div>
    );
}
