"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Flag,
  Layers,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell, triggerQuickRecord } from "@/components/layout/admin-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminMe,
  listAdminEvents,
  listAdminSwimmers,
  listAdminTeams,
} from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";

const workflowItems = [
  {
    title: "维护队伍与孩子档案",
    desc: "先建立队伍和孩子档案，后面的成绩、目标和公开页都会依赖这些关系。",
    icon: ShieldCheck,
    step: "01",
  },
  {
    title: "使用系统内置项目",
    desc: "项目目录默认来自国家标准，长池/短池天然分开，尽量直接选用。",
    icon: Layers,
    step: "02",
  },
  {
    title: "录入成绩并追踪进步",
    desc: "所有成绩统一按秒录入，训练、测试、比赛只表示成绩来源。",
    icon: TrendingUp,
    step: "03",
  },
  {
    title: "建立阶段目标",
    desc: "设置短期或长期目标，公开页会自动展示还差多少秒。",
    icon: Target,
    step: "04",
  },
];

const quickActionButtonClassName =
  "group flex h-auto w-full items-center justify-between gap-4 rounded-[28px] border border-border/60 bg-white/80 px-5 py-4 text-left text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-surface hover:shadow-lg hover:shadow-primary/5";

const quickActions = [
  {
    title: "快速录入成绩",
    subtitle: "Ctrl / Cmd + K",
    icon: Zap,
    iconClassName: "bg-amber-100 text-amber-600",
    kind: "action" as const,
  },
  {
    title: "添加目标成绩",
    subtitle: "Goal Setup",
    icon: Flag,
    iconClassName: "bg-emerald-100 text-emerald-600",
    href: "/admin/goals",
    kind: "link" as const,
  },
  {
    title: "查看项目目录",
    subtitle: "Event Catalog",
    icon: Layers,
    iconClassName: "bg-sky-100 text-sky-600",
    href: "/admin/events",
    kind: "link" as const,
  },
];

function QuickActionButton({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  href,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: typeof Zap;
  iconClassName: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-base font-black text-foreground">{title}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted/60">
            {subtitle}
          </span>
        </div>
      </div>
      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted/60 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
    </>
  );

  if (href) {
    return (
      <Link className={quickActionButtonClassName} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={quickActionButtonClassName} onClick={onClick} type="button">
      {content}
    </button>
  );
}

export default function AdminDashboardPage() {
  const [username, setUsername] = useState("");
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminMe(), listAdminSwimmers(), listAdminEvents(), listAdminTeams()])
      .then(([me, swimmers, events, teams]) => {
        setUsername(me.username);
        setSwimmerCount(swimmers.swimmers.length);
        setEventCount(events.events.length);
        setTeamCount(teams.teams.length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell
      description="这里是系统总览。你可以快速检查项目、队伍和孩子规模，并从下方快捷操作与管理流程继续推进。"
      title="管理后台首页"
    >
      <motion.div
        animate="animate"
        className="flex flex-col gap-10"
        initial="initial"
        variants={STAGGER_CONTAINER}
      >
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <LoadingState key={index} label="统计数据加载中" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={STAGGER_CONTAINER}
          >
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="身份已校验" label="当前管理员" value={username} />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="位在册孩子" label="孩子档案" value={`${swimmerCount}`} />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="个可用项目" label="项目目录" value={`${eventCount}`} />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="支队伍" label="受管队伍" value={`${teamCount}`} />
            </motion.div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <motion.div variants={FADE_IN_UP}>
            <Card className="h-full border-border/40 shadow-xl shadow-primary/5">
              <CardHeader className="border-b border-border/40 bg-surface/30 pb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">推进管理流程</CardTitle>
                    <CardDescription>
                      用一条流程线把常见管理动作串起来，避免遗漏关键步骤。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative pl-8">
                  <div className="absolute bottom-8 left-4 top-4 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
                  <div className="flex flex-col gap-8">
                    {workflowItems.map((item, index) => (
                      <div className="relative flex gap-5" key={item.step}>
                        <div className="absolute left-[-8px] top-3 flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-white text-[9px] font-black text-primary shadow-md">
                          {item.step}
                        </div>
                        <div className="ml-8 flex flex-1 flex-col rounded-[28px] border border-border/60 bg-white/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <h4 className="text-lg font-black tracking-tight text-foreground">
                                {item.title}
                              </h4>
                              <p className="text-sm leading-relaxed text-muted/80">
                                {item.desc}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                              <item.icon className="h-6 w-6" />
                            </div>
                          </div>
                          {index < workflowItems.length - 1 ? (
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/45">
                              <span>Next Step</span>
                              <ArrowDown className="h-3.5 w-3.5" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={FADE_IN_UP}>
            <Card className="h-full border-border/40 bg-background shadow-xl shadow-primary/5">
              <CardHeader className="border-b border-border/40 bg-surface/30 pb-8">
                <CardTitle className="text-2xl font-black">快速操作</CardTitle>
                <CardDescription>
                  直接从这里完成最常用的动作，不再依赖顶部提示。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-6 md:p-8">
                {quickActions.map((item) => (
                  <QuickActionButton
                    href={item.kind === "link" ? item.href : undefined}
                    icon={item.icon}
                    iconClassName={item.iconClassName}
                    key={item.title}
                    onClick={item.kind === "action" ? () => triggerQuickRecord() : undefined}
                    subtitle={item.subtitle}
                    title={item.title}
                  />
                ))}
              </CardContent>
              <CardFooter className="border-t border-border/40 pt-6">
                <div className="flex w-full flex-col items-center gap-2 text-muted/60">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em]">
                    Swimming Best
                  </div>
                  <div className="text-[10px] font-medium">
                    Unified Admin Shortcuts
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminShell>
  );
}
