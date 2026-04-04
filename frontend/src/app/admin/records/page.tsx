"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Layers, 
  History, 
  Plus, 
  Save, 
  Calendar, 
  Clock,
  UserCircle2,
  Trophy,
  Tag
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field, SelectField } from "@/components/shared/form-field";
import { TimeInput } from "@/components/shared/time-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  addContextPerformances,
  createContext,
  listAdminEvents,
  listAdminPerformances,
  listAdminSwimmers,
  quickRecordPerformance,
} from "@/lib/api/admin";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { AdminPerformance, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminRecordsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [recentPerformances, setRecentPerformances] = useState<AdminPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [contextSubmitting, setContextSubmitting] = useState(false);
  const [contextSuccess, setContextSuccess] = useState(false);

  const [quickForm, setQuickForm] = useState({
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
    sourceType: "test",
    performedOn: new Date().toISOString().split('T')[0],
  });
  
  const [contextForm, setContextForm] = useState({
    sourceType: "competition",
    title: "",
    performedOn: new Date().toISOString().split('T')[0],
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
  });

  useEffect(() => {
    Promise.all([listAdminSwimmers(), listAdminEvents(), listAdminPerformances()]).then(
      ([swimmersResponse, eventsResponse, performancesResponse]) => {
        setSwimmers(swimmersResponse.swimmers);
        setEvents(eventsResponse.events);
        setRecentPerformances(performancesResponse.performances);

        const firstSwimmerId = swimmersResponse.swimmers[0]?.id ?? "";
        const firstEventId = eventsResponse.events[0]?.id ?? "";

        setQuickForm((current) => ({ ...current, swimmerId: firstSwimmerId, eventId: firstEventId }));
        setContextForm((current) => ({ ...current, swimmerId: firstSwimmerId, eventId: firstEventId }));
        setLoading(false);
      },
    );
  }, []);

  async function refreshPerformances() {
    const response = await listAdminPerformances();
    setRecentPerformances(response.performances);
  }

  async function submitQuickRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuickSubmitting(true);
    setQuickSuccess(false);
    try {
      await quickRecordPerformance({
        ...quickForm,
        timeMs: Number(quickForm.timeMs),
      });
      await refreshPerformances();
      setQuickSuccess(true);
      toast.success("单条成绩已录入");
      setTimeout(() => setQuickSuccess(false), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    } finally {
      setQuickSubmitting(false);
    }
  }

  async function submitContextRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContextSubmitting(true);
    setContextSuccess(false);
    try {
      const context = await createContext({
        sourceType: contextForm.sourceType,
        title: contextForm.title,
        performedOn: contextForm.performedOn,
      });
      await addContextPerformances(context.id, [
        {
          swimmerId: contextForm.swimmerId,
          eventId: contextForm.eventId,
          timeMs: Number(contextForm.timeMs),
        },
      ]);
      await refreshPerformances();
      setContextSuccess(true);
      toast.success("上下文成绩已录入");
      setTimeout(() => setContextSuccess(false), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    } finally {
      setContextSubmitting(false);
    }
  }

  return (
    <AdminShell 
      description="录入新的成绩数据。支持快速单条录入，或创建训练/比赛上下文进行批量关联。" 
      title="成绩录入"
    >
      <div className="grid gap-8 xl:grid-cols-2 items-start">
        {/* Quick Record */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 border-border/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">单条快速录入</CardTitle>
                  <CardDescription>适用于零散、临时的单次成绩记录</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={submitQuickRecord}>
              <CardContent className="space-y-5">
                <SelectField
                  label="孩子姓名"
                  onChange={(value) => setQuickForm((current) => ({ ...current, swimmerId: value }))}
                  options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
                  value={quickForm.swimmerId}
                />
                
                <SelectField
                  label="成绩项目"
                  onChange={(value) => setQuickForm((current) => ({ ...current, eventId: value }))}
                  options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                  value={quickForm.eventId}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="录入成绩 (时间)">
                    <TimeInput
                      onChange={(ms) => setQuickForm((current) => ({ ...current, timeMs: ms }))}
                      value={quickForm.timeMs}
                    />
                  </Field>
                  <SelectField
                    label="数据来源"
                    onChange={(value) => setQuickForm((current) => ({ ...current, sourceType: value }))}
                    options={[
                      { label: "训练 (Training)", value: "training" },
                      { label: "测试 (Test)", value: "test" },
                      { label: "比赛 (Competition)", value: "competition" },
                      { label: "临时记录 (Single)", value: "single" },
                    ]}
                    value={quickForm.sourceType}
                  />
                </div>

                <Field label="发生日期">
                  <Input
                    className="h-11"
                    onChange={(event) => setQuickForm((current) => ({ ...current, performedOn: event.target.value }))}
                    type="date"
                    value={quickForm.performedOn}
                  />
                </Field>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  className="w-full gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={quickSubmitting}
                  success={quickSuccess}
                >
                  <Save className="h-4 w-4" />
                  提交单条成绩
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Context Record */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 border-border/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">结构化上下文录入</CardTitle>
                  <CardDescription>先定义场景(如月测)，再录入关联的多条成绩</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={submitContextRecord}>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <SelectField
                    label="场景性质"
                    onChange={(value) => setContextForm((current) => ({ ...current, sourceType: value }))}
                    options={[
                      { label: "训练", value: "training" },
                      { label: "测试", value: "test" },
                      { label: "正式比赛", value: "competition" },
                    ]}
                    value={contextForm.sourceType}
                  />
                  <Field label="场景标题">
                    <Input
                      placeholder="例如: 四月实战测验"
                      onChange={(event) => setContextForm((current) => ({ ...current, title: event.target.value }))}
                      value={contextForm.title}
                      required
                    />
                  </Field>
                </div>

                <Field label="场景日期">
                  <Input
                    className="h-11"
                    onChange={(event) => setContextForm((current) => ({ ...current, performedOn: event.target.value }))}
                    type="date"
                    value={contextForm.performedOn}
                    required
                  />
                </Field>

                <div className="pt-4 border-t border-border/40 space-y-5">
                  <SelectField
                    label="关联孩子"
                    onChange={(value) => setContextForm((current) => ({ ...current, swimmerId: value }))}
                    options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
                    value={contextForm.swimmerId}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField
                      label="成绩项目"
                      onChange={(value) => setContextForm((current) => ({ ...current, eventId: value }))}
                      options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                      value={contextForm.eventId}
                    />
                    <Field label="成绩结果">
                      <TimeInput
                        onChange={(ms) => setContextForm((current) => ({ ...current, timeMs: ms }))}
                        value={contextForm.timeMs}
                      />
                    </Field>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  variant="secondary"
                  className="w-full gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={contextSubmitting}
                  success={contextSuccess}
                >
                  <Plus className="h-4 w-4" />
                  保存并继续录入
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Recent Records */}
        <motion.div variants={FADE_IN_UP} className="xl:col-span-2">
          <Card className="shadow-xl shadow-primary/5 border-border/40 min-h-[400px]">
            <CardHeader className="pb-6 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>最近录入历史</CardTitle>
                  <CardDescription>系统中最新录入的成绩列表</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
               <motion.div 
                 variants={STAGGER_CONTAINER}
                 initial="initial"
                 animate="animate"
                 className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
               >
                 <AnimatePresence mode="popLayout">
                   {recentPerformances.map((performance) => (
                     <motion.div
                       layout
                       key={performance.id}
                       variants={FADE_IN_UP}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="group"
                     >
                       <Card className="h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5">
                         <CardContent className="p-6 flex flex-col gap-4">
                           <div className="flex items-start justify-between">
                             <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                                   <UserCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                   <h3 className="text-base font-black tracking-tight text-foreground">{describeSwimmer(performance.swimmer)}</h3>
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted/60 uppercase tracking-widest mt-0.5">
                                      <Calendar className="h-3 w-3" />
                                      <span>{performance.performedOn}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Trophy className="h-5 w-5" />
                             </div>
                           </div>
                           
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="bg-surface text-[10px] font-bold uppercase tracking-widest border-border/60">
                                    {performance.event.displayName}
                                 </Badge>
                              </div>
                              
                              <div className="text-3xl font-black tracking-tighter text-primary">
                                 {formatTimeMS(performance.timeMs)}
                              </div>
                           </div>

                           {performance.tags.length > 0 && (
                             <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/40">
                                {performance.tags.map((tag) => (
                                  <Badge 
                                    key={tag}
                                    className="bg-primary/5 text-primary border-transparent text-[9px] px-2 py-0 h-5 font-bold uppercase tracking-wider"
                                  >
                                    <Tag className="h-2.5 w-2.5 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                             </div>
                           )}
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>

               {recentPerformances.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-muted/5 text-muted/20 mb-6">
                       <Clock className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">暂无最近录入记录</h3>
                    <p className="text-muted font-medium mt-2">新录入的成绩将出现在这里。</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
