import { Footer } from "@/components/layout/Footer";
import { CartNotification } from "@/components/cart/CartNotification";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getCurrentUser } from "@/lib/auth";
import { AccountDataProvider } from "@/components/account/AccountDataProvider";
import { wishlistIds } from "@/services/account-data.service";
import { ShopChrome } from "@/components/layout/ShopChrome";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <AccountDataProvider key={user?.id ?? "guest"} userId={user?.id ?? null} initialIds={user ? await wishlistIds(user.id) : []}>
    <div id="top" className="flex min-h-screen flex-col">
      <ShopChrome><Header /></ShopChrome>
      <div className="flex-1">{children}</div>
      <ShopChrome><Footer /><FloatingSupport /></ShopChrome>
      <CartNotification />

      <ShopChrome><MobileBottomNav isAuthenticated={Boolean(user)} /></ShopChrome>
    </div>
    </AccountDataProvider>
  );
}
