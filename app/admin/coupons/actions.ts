"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createCoupon(formData: FormData) {
    const code = formData.get('code') as string;
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const active = formData.get('active') === 'on';

    const usageLimitRaw = formData.get('usageLimit') as string;
    const minCartValueRaw = formData.get('minCartValue') as string;

    const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw) : null;
    const minCartValue = minCartValueRaw ? parseFloat(minCartValueRaw) : null;

    if (!code || isNaN(value)) {
        throw new Error('Geçersiz kupon bilgileri.');
    }

    await prisma.coupon.create({
        data: {
            code: code.toUpperCase(),
            type,
            value,
            active,
            usageLimit,
            minCartValue
        }
    });

    revalidatePath('/admin/discounts');
    redirect('/admin/discounts');
}

export async function updateCoupon(id: number, formData: FormData) {
    const code = formData.get('code') as string;
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const active = formData.get('active') === 'on';

    const usageLimitRaw = formData.get('usageLimit') as string;
    const minCartValueRaw = formData.get('minCartValue') as string;

    const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw) : null;
    const minCartValue = minCartValueRaw ? parseFloat(minCartValueRaw) : null;

    if (!code || isNaN(value)) {
        throw new Error('Geçersiz kupon bilgileri.');
    }

    await prisma.coupon.update({
        where: { id },
        data: {
            code: code.toUpperCase(),
            type,
            value,
            active,
            usageLimit,
            minCartValue
        }
    });

    revalidatePath('/admin/discounts');
    redirect('/admin/discounts');
}

export async function deleteCoupon(id: number) {
    await prisma.coupon.delete({
        where: { id }
    });
    revalidatePath('/admin/discounts');
}
