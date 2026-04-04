"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Target, 
  Plus, 
  Flag, 
  Save, 
  Calendar, 
  TrendingUp, 
  UserCircle2,
  Clock,
  ChevronRight,
  ArrowRight
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field, SelectField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createGoal,
  listAdminEvents,
  listAdminGoals,
  listAdminSwimmers,
} from "@/lib/api/admin";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { AdminGoal, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminGoalsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    swimmerId: "",
    eventId: "",
    horizon: "short",
    title: "",
    targetTimeMs: 14500,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    Promise.all([listAdminSwimmers(), listAdminEvents(), listAdminGoals()]).then(
      ([swimmersResponse, eventsResponse, goalsResponse]) => {
        setSwimmers(swimmersResponse.swimmers);
        setEvents(eventsResponse.events);
        setGoals(goalsResponse.goals);
        setForm((current) => ({
          ...current,
          swimmerId: swimmersResponse.swimmers[0]?.id ?? "",
          eventId: eventsResponse.events[0]?.id ?? "",
        }));
        setLoading(false);
      },
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      await createGoal({
        ...form,
        targetTimeMs: Number(form.targetTimeMs),
      });
      const goalsResponse = await listAdminGoals();
      setGoals(goalsResponse.goals);
      setSuccess(true);
      toast.success("目标已成功创建");
      setTimeout(() => setSuccess(false), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建目标失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell 
      description="为学员设定具体项目的阶段性目标。系统将根据基线成绩与目标差距自动计算进度。" 
      title="目标管理"
    >
      <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)] items-start">
        {/* Form Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="sticky top-28 shadow-xl shadow-primary/5 border-border/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">创建新目标</CardTitle>
                  <CardDescription>设定一个新的成绩突破里程碑</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <SelectField
                  label="关联学员"
                  onChange={(value) => setForm((current) => ({ ...current, swimmerId: value }))}
                  options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
                  value={form.swimmerId}
                />
                
                <SelectField
                  label="挑战项目"
                  onChange={(value) => setForm((current) => ({ ...current, eventId: value }))}
                  options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                  value={form.eventId}
                />

                <SelectField
                  label="目标层级 (Horizon)"
                  onChange={(value) => setForm((current) => ({ ...current, horizon: value }))}
                  options={[
                    { label: "短期目标 (Short Term)", value: "short" },
                    { label: "中期目标 (Mid Term)", value: "mid" },
                    { label: "长期目标 (Long Term)", value: "long" },
                  ]}
                  value={form.horizon}
                />

                <Field label="目标名称">
                  <Input
                    placeholder="例如: 赛季末游进 30s"
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    value={form.title}
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <Field label="目标成绩 (毫秒)">
                     <Input
                       type="number"
                       placeholder="15000"
                       onChange={(event) => setForm((current) => ({ ...current, targetTimeMs: Number(event.target.value) }))}
                       value={form.targetTimeMs}
                       required
                     />
                   </Field>
                   <Field label="截止日期">
                     <Input
                       type="date"
                       className="h-11"
                       onChange={(event) => setForm((current) => ({ ...current, targetDate: event.target.value }))}
                       value={form.targetDate}
                       required
                     />
                   </Field>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  className="w-full gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={submitting}
                  success={success}
                >
                  <Target className="h-4 w-4" />
                  保存并激活目标
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* List Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 min-h-[600px] border-border/40">
            <CardHeader className="pb-6 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>已激活目标</CardTitle>
                  <CardDescription>当前正在追踪的 {goals.length} 个里程碑</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
               <motion.div 
                 variants={STAGGER_CONTAINER}
                 initial="initial"
                 animate="animate"
                 className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
               >
                 <AnimatePresence mode="popLayout">
                   {goals.map((goal) => (
                     <motion.div
                       layout
                       key={goal.id}
                       variants={FADE_IN_UP}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="group"
                     >
                       <Card className="h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5 overflow-hidden">
                         <CardContent className="p-0 flex flex-col h-full">
                           <div className="p-6 flex flex-col gap-4 flex-1">
                              <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-2">
                                    <Badge className={cn(
                                       "rounded-full px-2 py-0 h-5 text-[9px] font-bold uppercase tracking-wider border-transparent",
                                       goal.horizon === 'short' ? 'bg-blue-500/10 text-blue-600' :
                                       goal.horizon === 'mid' ? 'bg-amber-500/10 text-amber-600' :
                                       'bg-purple-500/10 text-purple-600'
                                    )}>
                                       {goal.horizon} Term
                                    </Badge>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                                    <Calendar className="h-3 w-3" />
                                    <span>{goal.targetDate}</span>
                                 </div>
                              </div>
                              
                              <div>
                                 <h3 className="text-xl font-black tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {goal.title}
                                 </h3>
                                 <div className="mt-4 flex flex-wrap gap-4">
                                    <div className="flex flex-col gap-0.5">
                                       <span className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">Baseline</span>
                                       <span className="text-sm font-black text-muted/80">{formatTimeMS(goal.baselineTimeMs)}</span>
                                    </div>
                                    <div className="flex items-center text-muted/20">
                                       <ArrowRight className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                       <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Target</span>
                                       <span className="text-sm font-black text-primary">{formatTimeMS(goal.targetTimeMs)}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {goal.swimmer && (
                             <div className="px-6 py-4 bg-surface/50 border-t border-border/40 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                                      <UserCircle2 className="h-4 w-4" />
                                   </div>
                                   <div>
                                      <div className="text-[10px] font-bold text-muted/40 uppercase tracking-widest leading-none">Swimmer</div>
                                      <div className="text-xs font-bold text-foreground">{describeSwimmer(goal.swimmer)}</div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 text-right">
                                   <div>
                                      <div className="text-[10px] font-bold text-muted/40 uppercase tracking-widest leading-none">Event</div>
                                      <div className="text-xs font-bold text-foreground">{goal.event?.displayName}</div>
                                   </div>
                                   <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/5 text-primary">
                                      <TrendingUp className="h-4 w-4" />
                                   </div>
                                </div>
                             </div>
                           )}
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>

               {goals.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[40px] bg-muted/5 text-muted/20 mb-6">
                       <Flag className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">当前没有任何激活的目标</h3>
                    <p className="text-muted font-medium mt-2">快去左侧表单为孩子们设定第一个里程碑吧！</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
