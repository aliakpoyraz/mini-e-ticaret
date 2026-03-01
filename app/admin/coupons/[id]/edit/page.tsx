import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditCouponForm from './edit-form';

const prisma = new PrismaClient();

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
        where: { id: parseInt(id) }
    });

    if (!coupon) {
        notFound();
    }

    return <EditCouponForm coupon={coupon} />;
}
