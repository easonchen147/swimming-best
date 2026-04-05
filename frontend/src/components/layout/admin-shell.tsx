"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  FileUp,
  Flag,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Shield,
  Trophy,
  TimerReset,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { QuickRecordModal } from "@/components/admin/quick-record-modal";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { getAdminMe, logoutAdmin } from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { cn } from "@/lib/utils";

import { PageTransition } from "./page-transition";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/teams", label: "队伍", icon: Shield },
  { href: "/admin/swimmers", label: "孩子", icon: Users },
  { href: "/admin/events", label: "项目", icon: Waves },
  { href: "/admin/records", label: "成绩", icon: Trophy },
  { href: "/admin/goals", label: "目标", icon: Flag },
  { href: "/admin/import", label: "导入", icon: FileUp },
];

const QUICK_RECORD_EVENT = "swimming-best:quick-record";
const headerActionButtonClassName = cn(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4",
  "text-sm font-bold tracking-[0.01em] transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
);

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
  const [authChecked, setAuthChecked] = useState(
    process.env.NODE_ENV === "test"
    || process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === "1",
  );
  const [quickRecordOpen, setQuickRecordOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const openQuickRecord = useCallback(() => {
    setQuickRecordOpen(true);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openQuickRecord();
    }
  }, [openQuickRecord]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(QUICK_RECORD_EVENT, openQuickRecord as EventListener);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(QUICK_RECORD_EVENT, openQuickRecord as EventListener);
    };
  }, [handleKeyDown, openQuickRecord]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    if (process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === "1") {
      return;
    }

    getAdminMe()
      .then(() => setAuthChecked(true))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function handleLogout() {
    if (logoutPending) {
      return;
    }

    try {
      setLogoutPending(true);
      await logoutAdmin();
      toast.success("已退出登录");
      router.replace("/admin/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "退出登录失败";
      toast.error(message);
    } finally {
      setLogoutPending(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-lg">
          <LoadingState label="校验管理员登录状态" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="grid-sheen sticky top-0 hidden h-screen border-r border-border bg-surface/40 px-6 py-8 backdrop-blur-2xl lg:block">
        <Sidebar
          pathname={pathname}
        />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                aria-label="打开导航"
                className="lg:hidden"
                onClick={() => setOpen((value) => !value)}
                size="icon"
                variant="secondary"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 lg:hidden">
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
              <Link
                className={cn(
                  headerActionButtonClassName,
                  "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800",
                )}
                href="/"
              >
                <Globe2 className="h-4 w-4" />
                <span className="hidden sm:inline">查看公开页</span>
              </Link>
              <Button
                aria-label="退出登录"
                className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                disabled={logoutPending}
                onClick={handleLogout}
                size="icon"
                variant="ghost"
              >
                {logoutPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden border-t border-border bg-surface/95 px-4 py-4 lg:hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
              >
                <Sidebar
                  compact
                  pathname={pathname}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
          <motion.section
            animate="animate"
            className="glass-card flex flex-col gap-2 p-6 md:p-8"
            initial="initial"
            variants={FADE_IN_UP}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted/80 text-balance">
              {description}
            </p>
          </motion.section>

          <PageTransition>{children}</PageTransition>
        </main>

        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <Button
            aria-label="快速录入"
            className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40"
            onClick={openQuickRecord}
            size="icon"
          >
            <Zap className="h-6 w-6" />
          </Button>
        </div>

        <QuickRecordModal
          onOpenChange={setQuickRecordOpen}
          onSuccess={() => {
            if (pathname === "/admin/records") {
              router.refresh();
            }
          }}
          open={quickRecordOpen}
        />
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
    <div className={cn("flex h-full flex-col", compact ? "" : "gap-8")}>
      {!compact ? (
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
      ) : null}

      <motion.nav
        animate="animate"
        className="flex flex-col gap-1.5"
        initial="initial"
        variants={STAGGER_CONTAINER}
      >
        {navItems.map((item) => {
          const active = item.href === "/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                {item.icon ? (
                  <item.icon
                    className={cn(
                      "h-4.5 w-4.5 transition-transform group-hover:scale-110",
                      active ? "text-white" : "text-muted group-hover:text-primary",
                    )}
                  />
                ) : null}
                <span>{item.label}</span>
                {active ? (
                  <motion.div
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
                    layoutId="sidebar-active"
                  />
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    </div>
  );
}

export function triggerQuickRecord() {
  window.dispatchEvent(new Event(QUICK_RECORD_EVENT));
}
