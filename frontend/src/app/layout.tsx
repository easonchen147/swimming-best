import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swimming Best",
  description: "儿童游泳成绩管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
