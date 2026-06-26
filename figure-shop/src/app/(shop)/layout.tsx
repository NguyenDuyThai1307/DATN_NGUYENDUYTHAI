import { Footer } from "@/components/layout/Footer";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getCurrentUser } from "@/lib/auth";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <FloatingSupport />
      <MobileBottomNav isAuthenticated={Boolean(user)} />
    </div>
  );
}
