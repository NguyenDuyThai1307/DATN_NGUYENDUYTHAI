import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Figure Shop",
  description: "Website thương mại điện tử cho cửa hàng mô hình sưu tầm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
