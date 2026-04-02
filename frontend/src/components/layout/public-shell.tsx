"use client";

import Link from "next/link";
import { Waves, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="grid-sheen min-h-screen">
      <header className="sticky top-0 z-20 border-b border-primary/8 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_16px_36px_rgba(30,64,175,0.24)]">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">
                Swimming Best
              </div>
              <div className="text-base font-semibold text-primary">
                儿童游泳成绩档案
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="/">首页</NavLink>
            <NavLink href="/compare">对比</NavLink>
            <NavLink href="/admin">管理后台</NavLink>
          </nav>

          <Link href="/admin/login">
            <Button size="sm">管理员登录</Button>
          </Link>
        </div>
      </header>

      <main className={cn("mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-6 md:py-8", className)}>
        {children}
      </main>

      <footer className="border-t border-primary/8 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-primary" />
            <span>多孩子成绩记录、PB 识别、目标管理、公开分享</span>
          </div>
          <div className="flex items-center gap-3">
            <Trophy className="h-4 w-4 text-accent" />
            <span>桌面端与移动端均可用</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-sm font-semibold text-primary/75 transition hover:bg-primary/6 hover:text-primary"
    >
      {children}
    </Link>
  );
}

