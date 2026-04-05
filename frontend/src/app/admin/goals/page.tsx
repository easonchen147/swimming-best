"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Calendar,
  Flag,
  Plus,
  Target,
  TrendingUp,
  UserCircle2,
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { DatePickerInput } from "@/components/shared/date-picker";
import { Field, SelectField } from "@/components/shared/form-field";
import { TimeInput } from "@/components/shared/time-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createGoal,
  listAdminEvents,
  listAdminGoals,
  listAdminSwimmers,
} from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import { cn } from "@/lib/utils";
import type { AdminGoal, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminGoalsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    swimmerId: "",
    eventId: "",
    horizon: "short",
    title: "",
    targetTimeMs: 14500,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    isPublic: true,
    publicNote: "",
    adminNote: "",
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
    try {
      await createGoal({
        ...form,
        targetTimeMs: Number(form.targetTimeMs),
      });
      const goalsResponse = await listAdminGoals();
      setGoals(goalsResponse.goals);
      toast.success("目标已创建");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建目标失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell
      description="目标只和队员、项目、截止日期以及目标成绩有关。日期和年份控件都与当前设计系统保持统一。"
      title="目标管理"
    >
      <div className="grid items-start gap-8 xl:grid-cols-[400px_minmax(0,1fr)]">
        <motion.div variants={FADE_IN_UP}>
          <Card className="sticky top-28 border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">创建新目标</CardTitle>
                  <CardDescription>为队员设置明确的项目成绩里程碑。</CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <SelectField
                  label="队员"
                  onChange={(value) => setForm((current) => ({ ...current, swimmerId: value }))}
                  options={swimmers.map((swimmer) => ({
                    label: describeSwimmer(swimmer),
                    value: swimmer.id,
                  }))}
                  value={form.swimmerId}
                />

                <SelectField
                  label="目标项目"
                  onChange={(value) => setForm((current) => ({ ...current, eventId: value }))}
                  options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                  value={form.eventId}
                />

                <SelectField
                  label="目标阶段"
                  onChange={(value) => setForm((current) => ({ ...current, horizon: value }))}
                  options={[
                    { label: "短期", value: "short" },
                    { label: "中期", value: "mid" },
                    { label: "长期", value: "long" },
                  ]}
                  value={form.horizon}
                />

                <Field label="目标名称">
                  <Input
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="例如：暑假前游进 35.50"
                    value={form.title}
                  />
                </Field>

                <Field label="目标成绩（秒）">
                  <TimeInput
                    onChange={(value) => setForm((current) => ({ ...current, targetTimeMs: value }))}
                    value={form.targetTimeMs}
                  />
                </Field>

                <Field label="截止日期">
                  <DatePickerInput
                    ariaLabel="截止日期"
                    onChange={(value) => setForm((current) => ({ ...current, targetDate: value }))}
                    value={form.targetDate}
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="公开备注">
                    <Input
                      onChange={(event) => setForm((current) => ({ ...current, publicNote: event.target.value }))}
                      placeholder="例如：暑假阶段重点目标"
                      value={form.publicNote}
                    />
                  </Field>
                  <Field label="内部备注">
                    <Input
                      onChange={(event) => setForm((current) => ({ ...current, adminNote: event.target.value }))}
                      placeholder="例如：重点看转身和节奏"
                      value={form.adminNote}
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/40 p-4">
                  <input
                    checked={form.isPublic}
                    className="h-5 w-5 cursor-pointer"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isPublic: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  <span className="text-sm font-medium text-foreground">公开显示该目标</span>
                </label>
              </CardContent>

              <CardFooter className="pt-2">
                <Button className="h-12 w-full gap-2 rounded-2xl" loading={submitting} type="submit">
                  <Target className="h-4 w-4" />
                  保存目标
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={FADE_IN_UP}>
          <Card className="min-h-[600px] border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="border-b border-border/40 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>已创建目标</CardTitle>
                  <CardDescription>当前共追踪 {goals.length} 个目标。</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {loading ? (
                <div className="text-sm text-muted">加载中...</div>
              ) : (
                <motion.div
                  animate="animate"
                  className="grid gap-6 lg:grid-cols-2"
                  initial="initial"
                  variants={STAGGER_CONTAINER}
                >
                  {goals.map((goal) => (
                    <motion.div key={goal.id} variants={FADE_IN_UP}>
                      <Card className="h-full overflow-hidden border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5">
                        <CardContent className="flex h-full flex-col gap-4 p-6">
                          <div className="flex items-start justify-between gap-3">
                            <Badge
                              className={cn(
                                "rounded-full border-transparent px-2 py-0 text-[9px] font-bold uppercase tracking-wider",
                                goal.horizon === "short"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : goal.horizon === "mid"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-purple-500/10 text-purple-600",
                              )}
                            >
                              {goal.horizon}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/60">
                              <Calendar className="h-3 w-3" />
                              <span>{goal.targetDate}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-xl font-black tracking-tight text-foreground">
                              {goal.title}
                            </h3>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
                                  Baseline
                                </span>
                                <span className="text-sm font-black text-muted/80">
                                  {formatTimeMS(goal.baselineTimeMs)}
                                </span>
                              </div>
                              <TrendingUp className="h-4 w-4 text-muted/30" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                  Target
                                </span>
                                <span className="text-sm font-black text-primary">
                                  {formatTimeMS(goal.targetTimeMs)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {goal.swimmer ? (
                            <div className="mt-auto flex items-center justify-between border-t border-border/40 bg-surface/50 px-0 pt-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                                  <UserCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
                                    队员
                                  </div>
                                  <div className="text-xs font-bold text-foreground">
                                    {describeSwimmer(goal.swimmer)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
                                  项目
                                </div>
                                <div className="text-xs font-bold text-foreground">
                                  {goal.event?.displayName}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
