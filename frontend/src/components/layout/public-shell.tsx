"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

import { cn } from "@/lib/utils";

import { PageTransition } from "./page-transition";

export function PublicShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link className="group flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Waves className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              Swimming <span className="text-primary">Best</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-all hover:bg-primary/5 hover:text-primary"
              href="/"
            >
              首页
            </Link>
            <Link
              className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-all hover:bg-primary/5 hover:text-primary"
              href="/compare"
            >
              对比
            </Link>
            <Link className="ml-2" href="/admin">
              <button className="cursor-pointer rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-95">
                管理后台
              </button>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link href="/compare">
              <button className="cursor-pointer rounded-full border border-border px-4 py-1.5 text-xs font-bold text-foreground">
                对比
              </button>
            </Link>
            <Link href="/admin">
              <button className="cursor-pointer rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background">
                管理
              </button>
            </Link>
          </div>
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
