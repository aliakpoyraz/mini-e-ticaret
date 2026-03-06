const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const postgresPrisma = new PrismaClient();

async function main() {
    const db = await open({
        filename: './prisma/dev.db',
        driver: sqlite3.Database
    });

    console.log('Fetching users...');
    const users = await db.all('SELECT * FROM User');
    for (const row of users) {
        try {
            await postgresPrisma.user.create({
                data: {
                    id: row.id,
                    email: row.email,
                    password: row.password,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    phone: row.phone,
                    role: row.role,
                    isBanned: row.isBanned === 1,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            });
            console.log('Created User', row.id);
        } catch (e) { console.log('Err User', row.id) }
    }

    const addresses = await db.all('SELECT * FROM Address');
    for (const row of addresses) {
        try {
            await postgresPrisma.address.create({
                data: {
                    id: row.id,
                    userId: row.userId,
                    title: row.title,
                    address: row.address,
                    city: row.city,
                    country: row.country,
                    zipCode: row.zipCode,
                    isDefault: row.isDefault === 1,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            });
            console.log('Created Address', row.id);
        } catch (e) { console.log('Err Address', row.id) }
    }

    const products = await db.all('SELECT * FROM Product');
    for (const row of products) {
        try {
            await postgresPrisma.product.create({
                data: {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    price: row.price,
                    imageUrl: row.imageUrl,
                    category: row.category,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            });
            console.log('Created Product', row.id);
        } catch (e) { console.log('Err Product', row.id, e) }
    }

    const variants = await db.all('SELECT * FROM Variant');
    for (const row of variants) {
        try {
            await postgresPrisma.variant.create({
                data: {
                    id: row.id,
                    name: row.name,
                    sku: row.sku,
                    stock: row.stock,
                    productId: row.productId
                }
            });
            console.log('Created Variant', row.id);
        } catch (e) { console.log('Err Variant', row.id) }
    }

    const productImages = await db.all('SELECT * FROM ProductImage');
    for (const row of productImages) {
        try {
            await postgresPrisma.productImage.create({
                data: {
                    id: row.id,
                    url: row.url,
                    productId: row.productId,
                    order: row.order,
                    createdAt: new Date(row.createdAt)
                }
            });
        } catch (e) { console.log('Err ProductImage', row.id) }
    }

    const discounts = await db.all('SELECT * FROM Discount');
    for (const row of discounts) {
        try {
            await postgresPrisma.discount.create({
                data: {
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    value: row.value,
                    active: row.active === 1,
                    productId: row.productId,
                    minCartValue: row.minCartValue,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            })
        } catch (e) { }
    }

    const coupons = await db.all('SELECT * FROM Coupon');
    for (const row of coupons) {
        try {
            await postgresPrisma.coupon.create({
                data: {
                    id: row.id,
                    code: row.code,
                    type: row.type,
                    value: row.value,
                    minCartValue: row.minCartValue,
                    active: row.active === 1,
                    usageLimit: row.usageLimit,
                    usedCount: row.usedCount,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            })
        } catch (e) { }
    }

    const favorites = await db.all('SELECT * FROM Favorite');
    for (const row of favorites) {
        try {
            await postgresPrisma.favorite.create({
                data: {
                    id: row.id,
                    userId: row.userId,
                    productId: row.productId,
                    createdAt: new Date(row.createdAt)
                }
            });
        } catch (e) { }
    }

    const reviews = await db.all('SELECT * FROM Review');
    for (const row of reviews) {
        try {
            await postgresPrisma.review.create({
                data: {
                    id: row.id,
                    rating: row.rating,
                    comment: row.comment,
                    userId: row.userId,
                    productId: row.productId,
                    status: row.status,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt)
                }
            });
        } catch (e) { }
    }

    const orders = await db.all('SELECT * FROM "Order"');
    for (const row of orders) {
        try {
            await postgresPrisma.order.create({
                data: {
                    id: row.id,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt),
                    status: row.status,
                    total: row.total,
                    userId: row.userId,
                    customerName: row.customerName,
                    customerAddress: row.customerAddress,
                    customerEmail: row.customerEmail,
                    customerPhone: row.customerPhone,
                    paymentMethod: row.paymentMethod,
                    couponCode: row.couponCode
                }
            });
            console.log('Created Order', row.id);
        } catch (e) { console.log('Err Order', row.id, e.message) }
    }

    const orderItems = await db.all('SELECT * FROM OrderItem');
    for (const row of orderItems) {
        try {
            await postgresPrisma.orderItem.create({
                data: {
                    id: row.id,
                    orderId: row.orderId,
                    variantId: row.variantId,
                    quantity: row.quantity,
                    price: row.price
                }
            });
        } catch (e) { console.log('Err OrderItem', row.id) }
    }

    const storeSettings = await db.all('SELECT * FROM StoreSettings');
    for (const row of storeSettings) {
        try {
            await postgresPrisma.storeSettings.upsert({
                where: { id: row.id },
                update: {
                    storeName: row.storeName,
                    description: row.description,
                    email: row.email,
                    phone: row.phone,
                    address: row.address,
                    currency: row.currency,
                    updatedAt: new Date(row.updatedAt)
                },
                create: {
                    id: row.id,
                    storeName: row.storeName,
                    description: row.description,
                    email: row.email,
                    phone: row.phone,
                    address: row.address,
                    currency: row.currency,
                    updatedAt: new Date(row.updatedAt)
                }
            })
            console.log('Created Settings');
        } catch (e) { }
    }

    console.log('Resyncing postgres sequences...');
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "User";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Product";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Variant"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Variant";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Order"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Order";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"OrderItem"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "OrderItem";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Address"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Address";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Discount"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Discount";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Coupon"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Coupon";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Favorite"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Favorite";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"ProductImage"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "ProductImage";`);
    await postgresPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Review"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Review";`);

    console.log('Migration complete');
}

main().catch(console.error).finally(() => postgresPrisma.$disconnect());
