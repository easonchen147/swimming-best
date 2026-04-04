"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  History,
  Layers,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
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
      title: "维护受管队伍",
      desc: "先建立队伍实体，后续孩子、项目和导出视图都会用到这些归属信息。",
      icon: ShieldCheck,
      step: "01",
    },
    {
      title: "定义结构化项目",
      desc: "把距离、泳姿和测试性质组合成标准项目，保证后续统计口径一致。",
      icon: Layers,
      step: "02",
    },
    {
      title: "录入成绩数据",
      desc: "通过快速录入或表格导入，把每次训练、测试、比赛结果沉淀下来。",
      icon: Activity,
      step: "03",
    },
    {
      title: "设定成长目标",
      desc: "为孩子建立短期和长期里程碑，公开页就能自动展示进度和差距。",
      icon: Target,
      step: "04",
    },
  ];

  return (
    <AdminShell
      description="这里是系统运行总览。你可以快速查看当前数据规模，并按推荐顺序进入常用管理流程。"
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
              <MetricCard caption="独立孩子档案" label="注册孩子档案" value={`${swimmerCount}`} />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="个结构化项目" label="已定义项目" value={`${eventCount}`} />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
              <MetricCard caption="个受管队伍实体" label="受管队伍" value={`${teamCount}`} />
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
                      按这个顺序操作，能更稳地搭好结构化数据，再进入成绩分析和公开展示。
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
                  常用管理动作的一键入口。
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col gap-3">
                <Link href="/admin/records">
                  <Button
                    className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5" />
                      <span className="text-base font-bold">录入新成绩</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                  </Button>
                </Link>
                <Link href="/admin/import">
                  <Button
                    className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <History className="h-5 w-5" />
                      <span className="text-base font-bold">批量导入表格</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                  </Button>
                </Link>
                <Link href="/admin/swimmers">
                  <Button
                    className="group h-14 w-full justify-between rounded-2xl border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/20"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <span className="text-base font-bold">管理学员档案</span>
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
                  <div className="text-[9px] font-medium italic">Version 1.2.0 Modern</div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminShell>
  );
}
