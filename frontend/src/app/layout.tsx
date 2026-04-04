import type { Metadata } from "next";
import "@fontsource/fira-sans/400.css";
import "@fontsource/fira-sans/500.css";
import "@fontsource/fira-sans/600.css";
import "@fontsource/fira-code/400.css";
import "@fontsource/fira-code/600.css";
import { Toaster } from "sonner";
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
    <html
      lang="zh-CN"
      className="h-full scroll-smooth antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
