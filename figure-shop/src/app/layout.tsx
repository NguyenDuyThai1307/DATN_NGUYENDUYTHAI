import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Figure Shop",
  description: "Website thuong mai dien tu cho cua hang mo hinh suu tam",
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
