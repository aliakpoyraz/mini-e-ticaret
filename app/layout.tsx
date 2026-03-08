import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "YZL321 Store | E-Ticaret Platformu",
  description: "Premium E-Ticaret Deneyimi",
};

import { CartProvider } from "./context/cart-context";
import Navbar from "./components/Navbar";
import { prisma } from "@/lib/prisma";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await (prisma as any).storeSettings.findUnique({ where: { id: 1 } });
  const storeName = settings?.storeName || "Store.";

  return (
    <html lang="tr">
      <body
        className={`${inter.variable} font-sans antialiased selection:bg-blue-100 selection:text-blue-900`}
      >
        <CartProvider>
          <Navbar
            storeName={storeName}
            announcement={settings?.announcement}
            isAnnouncementActive={settings?.isAnnouncementActive}
          />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
