"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
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
import { Button } from "@/components/ui/button";
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

  const workflowItems = [
    {
      title: "维护队伍与孩子档案",
      desc: "先把队伍和孩子基础信息建好，后面的成绩、目标和公开页都会依赖这些关系。",
      icon: ShieldCheck,
      step: "01",
    },
    {
      title: "使用系统内置项目",
      desc: "系统默认已经带入国家标准项目目录，直接选用；只有确实不够时再补自定义项目。",
      icon: Layers,
      step: "02",
    },
    {
      title: "录入成绩并追踪进步",
      desc: "所有成绩统一按秒输入，训练、测试、比赛只作为成绩来源，不再参与项目定义。",
      icon: Activity,
      step: "03",
    },
    {
      title: "建立阶段目标",
      desc: "为孩子设置短期或长期目标，公开页会自动展示还差多少秒。",
      icon: Target,
      step: "04",
    },
  ];

  return (
    <AdminShell
      description="这里是系统总览。你可以快速检查项目、队伍和孩子规模，并直接从下方快捷操作进入常用流程。"
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

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div className="lg:col-span-2" variants={FADE_IN_UP}>
            <Card className="h-full border-border/40 shadow-xl shadow-primary/5">
              <CardHeader className="border-b border-border/40 bg-surface/30 pb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">推荐管理流程</CardTitle>
                    <CardDescription>
                      先用系统内置的国家项目目录，再录成绩和目标，整个数据口径会更稳定。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  animate="animate"
                  className="grid gap-8 md:grid-cols-2"
                  initial="initial"
                  variants={STAGGER_CONTAINER}
                >
                  {workflowItems.map((item) => (
                    <motion.div
                      className="group relative flex items-start gap-6 transition-all"
                      key={item.step}
                      variants={FADE_IN_UP}
                    >
                      <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-border/60 bg-surface text-muted transition-all group-hover:-translate-y-1 group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                          <item.icon className="h-7 w-7" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-muted/30 transition-colors group-hover:text-primary">
                          {item.step}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        <h4 className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {item.title}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed text-muted/80">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={FADE_IN_UP}>
            <Card className="h-full overflow-hidden border-none bg-primary text-white shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 z-0">
                <div className="grid-sheen absolute inset-0 opacity-10" />
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-secondary opacity-30 blur-[60px]" />
              </div>
              <CardHeader className="relative z-10 pb-8">
                <CardTitle className="text-2xl font-black">快速操作</CardTitle>
                <CardDescription className="text-white/60">
                  常用动作集中放在这里，不再占用顶部栏位。
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col gap-3">
                <Button
                  className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                  onClick={() => triggerQuickRecord()}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-base font-bold">快速录入成绩</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                        Ctrl / Cmd + K
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                </Button>
                <Link href="/admin/goals">
                  <Button
                    className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Flag className="h-5 w-5" />
                      <span className="text-base font-bold">添加目标成绩</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                  </Button>
                </Link>
                <Link href="/admin/events">
                  <Button
                    className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5" />
                      <span className="text-base font-bold">查看项目目录</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                  </Button>
                </Link>
              </CardContent>
              <CardFooter className="relative z-10 pb-8 pt-12">
                <div className="flex w-full flex-col items-center gap-2 opacity-40">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em]">
                    Swimming Best
                  </div>
                  <div className="text-[9px] font-medium italic">National Event Catalog</div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminShell>
  );
}
