"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createDiscount(formData: FormData) {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const active = formData.get('active') === 'on';

    const conditionType = formData.get('conditionType') as string;
    const productIdRaw = formData.get('productId') as string;
    const minCartValueRaw = formData.get('minCartValue') as string;

    const productId = conditionType === 'PRODUCT' && productIdRaw ? parseInt(productIdRaw) : null;
    const minCartValue = conditionType === 'CART' && minCartValueRaw ? parseFloat(minCartValueRaw) : null;

    if (!name || isNaN(value)) {
        throw new Error('Geçersiz indirim bilgileri.');
    }

    await prisma.discount.create({
        data: {
            name,
            type,
            value,
            active,
            productId,
            minCartValue
        }
    });

    revalidatePath('/admin/discounts');
    revalidatePath('/products');
    redirect('/admin/discounts');
}

export async function updateDiscount(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const active = formData.get('active') === 'on';

    const conditionType = formData.get('conditionType') as string;
    const productIdRaw = formData.get('productId') as string;
    const minCartValueRaw = formData.get('minCartValue') as string;

    const productId = conditionType === 'PRODUCT' && productIdRaw ? parseInt(productIdRaw) : null;
    const minCartValue = conditionType === 'CART' && minCartValueRaw ? parseFloat(minCartValueRaw) : null;

    if (!name || isNaN(value)) {
        throw new Error('Geçersiz indirim bilgileri.');
    }

    await prisma.discount.update({
        where: { id },
        data: {
            name,
            type,
            value,
            active,
            productId,
            minCartValue
        }
    });

    revalidatePath('/admin/discounts');
    revalidatePath('/products');
    redirect('/admin/discounts');
}

export async function deleteDiscount(id: number) {
    await prisma.discount.delete({
        where: { id }
    });

    revalidatePath('/admin/discounts');
    revalidatePath('/products');
}
