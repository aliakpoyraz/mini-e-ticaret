"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(prevState: any, formData: FormData) {
    const storeName = formData.get('storeName') as string;
    const description = formData.get('description') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const currency = formData.get('currency') as string;

    await prisma.storeSettings.upsert({
        where: { id: 1 },
        update: { storeName, description, email, phone, address, currency },
        create: { id: 1, storeName, description, email, phone, address, currency }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout');

    return { success: true };
}
