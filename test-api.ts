import { POST } from './app/api/orders/route';

async function test() {
    const mockRequest = {
        json: async () => ({
            items: [{ variantId: 1, quantity: 1 }],
            customerName: "Test",
            customerAddress: "Test Address",
            customerEmail: "test@example.com",
            customerPhone: "+90 555 123 4567",
            paymentMethod: "CASH_ON_DELIVERY",
            couponCode: ""
        })
    } as unknown as Request;

    try {
        const res = await POST(mockRequest);
        console.log("Status:", res.status);
        const data = await res.text();
        console.log("Data:", data);
    } catch (e: any) {
        console.error("Caught error:", e);
    }
}

test();
