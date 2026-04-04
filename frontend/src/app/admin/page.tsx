"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Activity,
  History,
  Target
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    { title: "维护受管队伍", desc: "在“队伍”页面定义实体，为后续分类打好基础。", icon: ShieldCheck, step: "01" },
    { title: "定义结构化项目", desc: "创建标准的距离与泳姿组合，确保数据对比的准确性。", icon: Layers, step: "02" },
    { title: "录入成绩数据", desc: "通过快速录入或上传表格，记录每一次的进步曲线。", icon: Activity, step: "03" },
    { title: "设定成长目标", desc: "为学员设定具体的突破里程碑，自动追踪完成情况。", icon: Target, step: "04" },
  ];

  return (
    <AdminShell
      description="系统实时状态概览。在这里查看管理实体的统计数据，并按照推荐流程开始工作。"
      title="管理后台首页"
    >
      <motion.div 
        initial="initial"
        animate="animate"
        variants={STAGGER_CONTAINER}
        className="flex flex-col gap-10"
      >
        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <LoadingState key={i} label="统计数据加载中" />)}
          </div>
        ) : (
          <motion.div 
            variants={STAGGER_CONTAINER}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={FADE_IN_UP}>
               <MetricCard label="当前管理员" value={username} caption="身份已校验" />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
               <MetricCard label="注册孩子档案" value={`${swimmerCount}`} caption="个独立档案" />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
               <MetricCard label="已定义项目" value={`${eventCount}`} caption="个结构化项目" />
            </motion.div>
            <motion.div variants={FADE_IN_UP}>
               <MetricCard label="受管队伍实体" value={`${teamCount}`} caption="个活跃队伍" />
            </motion.div>
          </motion.div>
        )}

        {/* Workflow & Quick Actions */}
        <div className="grid gap-8 lg:grid-cols-3">
           <motion.div variants={FADE_IN_UP} className="lg:col-span-2">
              <Card className="h-full shadow-xl shadow-primary/5 border-border/40">
                <CardHeader className="pb-8 border-b border-border/40 bg-surface/30">
                   <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                         <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                         <CardTitle className="text-xl">推荐管理流程</CardTitle>
                         <CardDescription>按照此顺序操作可确保系统数据结构的完整性与一致性</CardDescription>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="grid gap-8 md:grid-cols-2">
                      {workflowItems.map((item, idx) => (
                        <div key={idx} className="group relative flex gap-6 items-start transition-all">
                           <div className="flex-shrink-0 flex flex-col items-center gap-2">
                              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface border border-border/60 text-muted transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                                 <item.icon className="h-7 w-7" />
                              </div>
                              <span className="font-mono text-[10px] font-bold text-muted/30 group-hover:text-primary transition-colors">{item.step}</span>
                           </div>
                           <div className="flex flex-col gap-1 pt-1">
                              <h4 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                              <p className="text-sm font-medium text-muted/80 leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
           </motion.div>

           <motion.div variants={FADE_IN_UP}>
              <Card className="h-full bg-primary text-white border-none shadow-2xl shadow-primary/20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                   <div className="grid-sheen absolute inset-0 opacity-10" />
                   <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-secondary blur-[60px] opacity-30" />
                </div>
                <CardHeader className="relative z-10 pb-8">
                   <CardTitle className="text-2xl font-black">快速操作</CardTitle>
                   <CardDescription className="text-white/60">常用功能的一键入口</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 flex flex-col gap-3">
                   <Button variant="outline" className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 h-14 rounded-2xl group px-6">
                      <div className="flex items-center gap-3">
                         <Activity className="h-5 w-5" />
                         <span className="font-bold text-base">录入新成绩</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                   </Button>
                   <Button variant="outline" className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 h-14 rounded-2xl group px-6">
                      <div className="flex items-center gap-3">
                         <History className="h-5 w-5" />
                         <span className="font-bold text-base">批量导入表格</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                   </Button>
                   <Button variant="outline" className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 h-14 rounded-2xl group px-6">
                      <div className="flex items-center gap-3">
                         <Users className="h-5 w-5" />
                         <span className="font-bold text-base">管理学员档案</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                   </Button>
                </CardContent>
                <CardFooter className="relative z-10 pt-12 pb-8">
                   <div className="flex flex-col items-center w-full gap-2 opacity-40">
                      <div className="text-[10px] font-bold uppercase tracking-[0.4em]">Swimming Best</div>
                      <div className="text-[9px] font-medium italic">Version 1.2.0-modern</div>
                   </div>
                </CardFooter>
              </Card>
           </motion.div>
        </div>
      </motion.div>
    </AdminShell>
  );
}
