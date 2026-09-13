import { Footer } from "@/components/layout/Footer";
import { CartNotification } from "@/components/cart/CartNotification";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getCurrentUser } from "@/lib/auth";
import { AccountDataProvider } from "@/components/account/AccountDataProvider";
import { wishlistIds } from "@/services/account-data.service";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <AccountDataProvider key={user?.id ?? "guest"} userId={user?.id ?? null} initialIds={user ? await wishlistIds(user.id) : []}>
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <FloatingSupport />
      <CartNotification />

      <MobileBottomNav isAuthenticated={Boolean(user)} />
    </div>
    </AccountDataProvider>
  );
}
