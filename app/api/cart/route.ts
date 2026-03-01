import { NextResponse } from 'next/server';

// Gerçek bir uygulamada veritabanı veya oturum (session) kullanılır.
// MVP için sepet yalnızca istemci tarafında tutuluyor.

export async function POST(request: Request) {
    // Sepetteki ürünler için stok doğrulama
    return NextResponse.json({ message: "Cart synced" });
}
