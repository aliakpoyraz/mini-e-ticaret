import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditDiscountForm from './edit-form';

const prisma = new PrismaClient();

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const discountId = parseInt(id);

    if (isNaN(discountId)) {
        notFound();
    }

    const discount = await prisma.discount.findUnique({
        where: { id: discountId }
    });

    if (!discount) {
        notFound();
    }

    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <EditDiscountForm discount={discount} products={products} />;
}
