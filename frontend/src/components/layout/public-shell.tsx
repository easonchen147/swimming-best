"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

import { cn } from "@/lib/utils";

export function PublicShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-primary/8 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Waves className="h-4.5 w-4.5" />
            </div>
            <span className="text-base font-semibold text-primary">
              Swimming Best
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              className="rounded-full px-3 py-1.5 text-sm font-medium text-primary/70 transition hover:bg-primary/6 hover:text-primary"
              href="/"
            >
              首页
            </Link>
            <Link
              className="rounded-full px-3 py-1.5 text-sm font-medium text-primary/70 transition hover:bg-primary/6 hover:text-primary"
              href="/admin"
            >
              管理后台
            </Link>
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-6 md:py-8", className)}>
        {children}
      </main>

      <footer className="border-t border-primary/6 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted md:px-6">
          Swimming Best · 儿童游泳成绩档案
        </div>
      </footer>
    </div>
  );
}
