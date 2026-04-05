"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PageTransition } from "./page-transition";

export function PublicShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const navActions = [
    {
      href: "/",
      label: "首页",
      variant: "outline" as const,
      className:
        "rounded-full border-border/60 bg-white text-foreground hover:border-primary/20 hover:bg-surface hover:text-primary",
    },
    {
      href: "/compare",
      label: "对比",
      variant: "outline" as const,
      className:
        "rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800",
    },
    {
      href: "/admin",
      label: "管理后台",
      variant: "primary" as const,
      className: "rounded-full shadow-primary/25",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link className="group flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Waves className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              Swimming <span className="text-primary">Best</span>
            </span>
          </Link>

          <nav className="grid w-full grid-cols-3 gap-2 lg:flex lg:w-auto lg:items-center">
            {navActions.map((item) => (
              <Button
                asChild
                className={item.className}
                key={item.href}
                size="sm"
                variant={item.variant}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12",
          className,
        )}
      >
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="border-t border-border bg-surface/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center md:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Swimming Best</span>
            </div>
            <p className="text-xs text-muted/60">
              © {new Date().getFullYear()} Swimming Best · 少儿游泳成绩管理系统 ·
              让每一份进步都被看见
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
