"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { getAdminMe } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "概览" },
  { href: "/admin/teams", label: "队伍" },
  { href: "/admin/swimmers", label: "孩子" },
  { href: "/admin/events", label: "项目" },
  { href: "/admin/records", label: "成绩" },
  { href: "/admin/goals", label: "目标" },
];

export function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(process.env.NODE_ENV === "test");

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    getAdminMe()
      .then(() => setAuthChecked(true))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-lg">
          <LoadingState label="校验管理员登录态" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-primary/8 bg-white/70 px-5 py-6 backdrop-blur-xl lg:block">
        <Sidebar pathname={pathname} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-primary/8 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                aria-label="打开导航"
                className="lg:hidden"
                variant="secondary"
                size="sm"
                onClick={() => setOpen((value) => !value)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.24em] text-primary/60">
                  Admin Panel
                </div>
                <div className="text-lg font-semibold text-primary">{title}</div>
              </div>
            </div>

            <Link href="/">
              <Button size="sm" variant="ghost">
                公开页
              </Button>
            </Link>
          </div>
          {open ? (
            <div className="border-t border-primary/8 px-4 py-3 lg:hidden">
              <Sidebar compact pathname={pathname} />
            </div>
          ) : null}
        </header>

        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
          <section className="rounded-[28px] border border-primary/8 bg-white/75 px-5 py-5 shadow-[0_22px_70px_rgba(30,64,175,0.08)]">
            <h1 className="text-2xl font-semibold text-primary md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted md:text-base">
              {description}
            </p>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3", compact ? "" : "sticky top-6")}>
      <div className="mb-3 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
          <TimerReset className="h-5 w-5" />
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.24em] text-primary/60">
            Swimming Best
          </div>
          <div className="text-sm font-semibold text-primary">后台操作台</div>
        </div>
      </div>

      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              active
                ? "bg-primary text-white shadow-[0_16px_36px_rgba(30,64,175,0.22)]"
                : "bg-white/80 text-primary hover:bg-primary/6",
            )}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
