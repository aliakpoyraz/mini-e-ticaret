import { prisma } from '@/lib/prisma';
import EditProductForm from './edit-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { variants: true }
    });

    if (!product) {
        return <div>Ürün bulunamadı</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Ürünü Düzenle</h1>
            <EditProductForm product={product} />
        </div>
    );
}
