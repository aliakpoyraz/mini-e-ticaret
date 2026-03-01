import { PrismaClient } from '@prisma/client';
import NewDiscountForm from './new-form';

const prisma = new PrismaClient();

export default async function NewDiscountPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <NewDiscountForm products={products} />;
}
