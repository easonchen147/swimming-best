"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Calendar,
  Clock3,
  History,
  Layers,
  Plus,
  Save,
  UserCircle2,
  Zap,
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
import {
  addContextPerformances,
  createContext,
  listAdminEvents,
  listAdminPerformances,
  listAdminSwimmers,
  quickRecordPerformance,
} from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import type { AdminPerformance, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminRecordsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [recentPerformances, setRecentPerformances] = useState<AdminPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [contextSubmitting, setContextSubmitting] = useState(false);

  const [quickForm, setQuickForm] = useState({
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
    sourceType: "test",
    performedOn: new Date().toISOString().split("T")[0],
    publicNote: "",
    adminNote: "",
    tags: "",
  });

  const [contextForm, setContextForm] = useState({
    sourceType: "competition",
    title: "",
    performedOn: new Date().toISOString().split("T")[0],
    location: "",
    publicNote: "",
    adminNote: "",
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
    performancePublicNote: "",
    performanceAdminNote: "",
    tags: "",
  });

  useEffect(() => {
    Promise.all([listAdminSwimmers(), listAdminEvents(), listAdminPerformances()]).then(
      ([swimmersResponse, eventsResponse, performancesResponse]) => {
        setSwimmers(swimmersResponse.swimmers);
        setEvents(eventsResponse.events);
        setRecentPerformances(performancesResponse.performances);

        const swimmerId = swimmersResponse.swimmers[0]?.id ?? "";
        const eventId = eventsResponse.events[0]?.id ?? "";

        setQuickForm((current) => ({ ...current, swimmerId, eventId }));
        setContextForm((current) => ({ ...current, swimmerId, eventId }));
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
    try {
      await quickRecordPerformance({
        ...quickForm,
        timeMs: Number(quickForm.timeMs),
        tags: quickForm.tags
          .split(/[,;，；]/)
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await refreshPerformances();
      toast.success("成绩已录入");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    } finally {
      setQuickSubmitting(false);
    }
  }

  async function submitContextRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContextSubmitting(true);
    try {
      const context = await createContext({
        sourceType: contextForm.sourceType,
        title: contextForm.title,
        performedOn: contextForm.performedOn,
        location: contextForm.location,
        publicNote: contextForm.publicNote,
        adminNote: contextForm.adminNote,
        tags: contextForm.tags
          .split(/[,;，；]/)
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await addContextPerformances(context.id, [
        {
          swimmerId: contextForm.swimmerId,
          eventId: contextForm.eventId,
          timeMs: Number(contextForm.timeMs),
          publicNote: contextForm.performancePublicNote,
          adminNote: contextForm.performanceAdminNote,
          tags: contextForm.tags
            .split(/[,;，；]/)
            .map((item) => item.trim())
            .filter(Boolean),
        },
      ]);
      await refreshPerformances();
      toast.success("场景成绩已录入");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    } finally {
      setContextSubmitting(false);
    }
  }

  return (
    <AdminShell
      description="项目负责定义“游什么”，训练/测试/比赛只负责说明“这条成绩怎么来的”。所有成绩统一按秒输入。"
      title="成绩录入"
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">快速录入单条成绩</CardTitle>
                  <CardDescription>适合临时记录一条训练、测试或比赛成绩。</CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={submitQuickRecord}>
              <CardContent className="space-y-5">
                <SelectField
                  label="孩子"
                  onChange={(value) => setQuickForm((current) => ({ ...current, swimmerId: value }))}
                  options={swimmers.map((swimmer) => ({
                    label: describeSwimmer(swimmer),
                    value: swimmer.id,
                  }))}
                  value={quickForm.swimmerId}
                />

                <SelectField
                  label="项目"
                  onChange={(value) => setQuickForm((current) => ({ ...current, eventId: value }))}
                  options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                  value={quickForm.eventId}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="成绩（秒）">
                    <TimeInput
                      onChange={(value) => setQuickForm((current) => ({ ...current, timeMs: value }))}
                      value={quickForm.timeMs}
                    />
                  </Field>
                  <SelectField
                    label="成绩来源"
                    onChange={(value) => setQuickForm((current) => ({ ...current, sourceType: value }))}
                    options={[
                      { label: "训练", value: "training" },
                      { label: "测试", value: "test" },
                      { label: "比赛", value: "competition" },
                      { label: "单次录入", value: "single" },
                    ]}
                    value={quickForm.sourceType}
                  />
                </div>

                <Field label="发生日期">
                  <DatePickerInput
                    ariaLabel="发生日期"
                    onChange={(value) =>
                      setQuickForm((current) => ({ ...current, performedOn: value }))
                    }
                    value={quickForm.performedOn}
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="公开备注">
                    <Input
                      onChange={(event) =>
                        setQuickForm((current) => ({ ...current, publicNote: event.target.value }))
                      }
                      placeholder="例如：出发表现不错"
                      value={quickForm.publicNote}
                    />
                  </Field>
                  <Field label="内部备注 / 标签">
                    <Input
                      onChange={(event) =>
                        setQuickForm((current) => ({ ...current, tags: event.target.value }))
                      }
                      placeholder="例如：月测；晚训；主项"
                      value={quickForm.tags}
                    />
                  </Field>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button className="h-12 w-full gap-2 rounded-2xl" loading={quickSubmitting} type="submit">
                  <Save className="h-4 w-4" />
                  提交单条成绩
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={FADE_IN_UP}>
          <Card className="border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">按场景录入</CardTitle>
                  <CardDescription>先定义训练/测试/比赛场景，再把成绩挂到这个场景下。</CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={submitContextRecord}>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="场景性质"
                    onChange={(value) => setContextForm((current) => ({ ...current, sourceType: value }))}
                    options={[
                      { label: "训练", value: "training" },
                      { label: "测试", value: "test" },
                      { label: "比赛", value: "competition" },
                    ]}
                    value={contextForm.sourceType}
                  />
                  <Field label="场景标题">
                    <Input
                      onChange={(event) =>
                        setContextForm((current) => ({ ...current, title: event.target.value }))
                      }
                      placeholder="例如：四月月测"
                      value={contextForm.title}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="场景日期">
                    <DatePickerInput
                      ariaLabel="场景日期"
                      onChange={(value) =>
                        setContextForm((current) => ({ ...current, performedOn: value }))
                      }
                      value={contextForm.performedOn}
                    />
                  </Field>
                  <Field label="地点 / 场馆">
                    <Input
                      onChange={(event) =>
                        setContextForm((current) => ({ ...current, location: event.target.value }))
                      }
                      placeholder="例如：东区 25 米池"
                      value={contextForm.location}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="公开备注">
                    <Input
                      onChange={(event) =>
                        setContextForm((current) => ({ ...current, publicNote: event.target.value }))
                      }
                      placeholder="例如：四月月测"
                      value={contextForm.publicNote}
                    />
                  </Field>
                  <Field label="内部备注 / 标签">
                    <Input
                      onChange={(event) =>
                        setContextForm((current) => ({ ...current, tags: event.target.value }))
                      }
                      placeholder="例如：月测；主项"
                      value={contextForm.tags}
                    />
                  </Field>
                </div>

                <div className="space-y-5 border-t border-border/40 pt-5">
                  <SelectField
                    label="关联孩子"
                    onChange={(value) => setContextForm((current) => ({ ...current, swimmerId: value }))}
                    options={swimmers.map((swimmer) => ({
                      label: describeSwimmer(swimmer),
                      value: swimmer.id,
                    }))}
                    value={contextForm.swimmerId}
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label="项目"
                      onChange={(value) => setContextForm((current) => ({ ...current, eventId: value }))}
                      options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                      value={contextForm.eventId}
                    />
                    <Field label="成绩（秒）">
                      <TimeInput
                        onChange={(value) => setContextForm((current) => ({ ...current, timeMs: value }))}
                        value={contextForm.timeMs}
                      />
                    </Field>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  className="h-12 w-full gap-2 rounded-2xl"
                  loading={contextSubmitting}
                  type="submit"
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" />
                  保存场景并录入成绩
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div className="xl:col-span-2" variants={FADE_IN_UP}>
          <Card className="min-h-[400px] border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="border-b border-border/40 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>最近录入记录</CardTitle>
                  <CardDescription>系统里最新录入的成绩会显示在这里。</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {loading ? (
                <div className="text-sm text-muted">加载中...</div>
              ) : (
                <motion.div
                  animate="animate"
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  initial="initial"
                  variants={STAGGER_CONTAINER}
                >
                  {recentPerformances.map((performance) => (
                    <motion.div key={performance.id} variants={FADE_IN_UP}>
                      <Card className="h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5">
                        <CardContent className="flex h-full flex-col gap-4 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <UserCircle2 className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-base font-black tracking-tight text-foreground">
                                  {describeSwimmer(performance.swimmer)}
                                </h3>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/60">
                                  <Calendar className="h-3 w-3" />
                                  <span>{performance.performedOn}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <Clock3 className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-foreground">
                              {performance.event.displayName}
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-primary">
                              {formatTimeMS(performance.timeMs)}
                            </div>
                          </div>

                          {performance.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 border-t border-border/40 pt-4">
                              {performance.tags.map((tag) => (
                                <span
                                  className="rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"
                                  key={tag}
                                >
                                  {tag}
                                </span>
                              ))}
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
