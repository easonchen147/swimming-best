"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, TimerReset, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { getAdminMe } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { PageTransition } from "./page-transition";
import { STAGGER_CONTAINER, FADE_IN_UP } from "@/lib/animations";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/teams", label: "队伍" },
  { href: "/admin/swimmers", label: "孩子" },
  { href: "/admin/events", label: "项目" },
  { href: "/admin/standards", label: "标准" },
  { href: "/admin/records", label: "成绩" },
  { href: "/admin/goals", label: "目标" },
  { href: "/admin/import", label: "导入" },
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
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="grid-sheen sticky top-0 hidden h-screen border-r border-border bg-surface/40 px-6 py-8 backdrop-blur-2xl lg:block">
        <Sidebar pathname={pathname} />
      </aside>

      <div className="flex min-h-screen flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                aria-label="打开导航"
                className="lg:hidden"
                variant="secondary"
                size="icon"
                onClick={() => setOpen((value) => !value)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="lg:hidden flex items-center gap-2">
                <TimerReset className="h-6 w-6 text-primary" />
                <span className="font-bold text-primary">Swimming Best</span>
              </div>
              <div className="hidden lg:block">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted/60">
                  {pathname === "/admin" ? "Dashboard" : "Admin Panel"}
                </div>
                <div className="text-xl font-bold text-foreground">{title}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button size="sm" variant="ghost" className="rounded-full">
                  查看公开页
                </Button>
              </Link>
            </div>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border px-4 py-4 lg:hidden bg-surface/95"
              >
                <Sidebar compact pathname={pathname} />
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
          <motion.section 
            initial="initial"
            animate="animate"
            variants={FADE_IN_UP}
            className="glass-card flex flex-col gap-2 p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {title}
              </h1>
            </div>
            <p className="max-w-3xl text-base text-muted/80 text-balance leading-relaxed">
              {description}
            </p>
          </motion.section>
          
          <PageTransition>
            {children}
          </PageTransition>
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
    <div className={cn("flex flex-col h-full", compact ? "" : "gap-8")}>
      {!compact && (
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <TimerReset className="h-6 w-6" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
              Swimming
            </div>
            <div className="text-lg font-black tracking-tight text-primary">BEST</div>
          </div>
        </div>
      )}

      <motion.nav 
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-1.5"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <motion.div key={item.href} variants={FADE_IN_UP}>
              <Link
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-xl shadow-primary/15"
                    : "text-muted hover:bg-primary/5 hover:text-primary",
                )}
                href={item.href}
              >
                {item.icon && <item.icon className={cn("h-4.5 w-4.5 transition-transform group-hover:scale-110", active ? "text-white" : "text-muted group-hover:text-primary")} />}
                <span>{item.label}</span>
                {active && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {!compact && (
        <div className="mt-auto px-2">
           <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl text-muted hover:text-rose-500 hover:bg-rose-50">
             <LogOut className="h-4.5 w-4.5" />
             <span>退出登录</span>
           </Button>
        </div>
      )}
    </div>
  );
}
