"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Layers,
  Plus,
  Save,
  Search,
  Trophy,
  Waves,
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
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
import { Select } from "@/components/ui/select";
import { createAdminEvent, listAdminEvents } from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { EventDefinition } from "@/lib/types";

const strokeOptions = [
  { label: "自由泳", value: "freestyle" },
  { label: "仰泳", value: "backstroke" },
  { label: "蛙泳", value: "breaststroke" },
  { label: "蝶泳", value: "butterfly" },
  { label: "混合泳", value: "medley" },
];

function eventIdentity(event: Pick<EventDefinition, "poolLengthM" | "distanceM" | "stroke">) {
  return `${event.poolLengthM}-${event.distanceM}-${event.stroke}`;
}

function dedupeEvents(events: EventDefinition[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = eventIdentity(event);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function strokeLabel(stroke: string) {
  return strokeOptions.find((item) => item.value === stroke)?.label ?? stroke;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    poolLengthM: 25,
    distanceM: 50,
    stroke: "freestyle",
  });

  useEffect(() => {
    listAdminEvents()
      .then((response) => setEvents(dedupeEvents(response.events)))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        event.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [events, searchTerm],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duplicate = events.some(
      (item) =>
        item.poolLengthM === form.poolLengthM
        && item.distanceM === form.distanceM
        && item.stroke === form.stroke,
    );
    if (duplicate) {
      toast.error("该项目已经存在");
      return;
    }
    setSubmitting(true);

    try {
      const created = await createAdminEvent(form);
      setEvents((current) => dedupeEvents([...current, created]));
      setForm({
        poolLengthM: 25,
        distanceM: 50,
        stroke: "freestyle",
      });
      toast.success("项目已创建");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell
      description="项目只按泳池长度、距离和泳姿定义。长池和短池是两个不同项目，男女共用同一套项目目录。"
      title="项目管理"
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
                  <CardTitle className="text-xl">新增自定义项目</CardTitle>
                  <CardDescription>
                    系统已内置国家标准项目；只有确实不够时，才需要额外补充自定义项目。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <Field label="泳池长度">
                  <Select
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        poolLengthM: Number(event.target.value),
                      }))
                    }
                    value={String(form.poolLengthM)}
                  >
                    <option value="25">25 米（短池）</option>
                    <option value="50">50 米（长池）</option>
                  </Select>
                </Field>

                <Field label="项目距离（米）">
                  <Input
                    min={25}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        distanceM: Number(event.target.value),
                      }))
                    }
                    placeholder="例如：50"
                    type="number"
                    value={form.distanceM}
                  />
                </Field>

                <Field label="泳姿">
                  <Select
                    onChange={(event) =>
                      setForm((current) => ({ ...current, stroke: event.target.value }))
                    }
                    value={form.stroke}
                  >
                    {strokeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardContent>

              <CardFooter className="pt-2">
                <Button className="h-12 w-full gap-2 rounded-2xl" loading={submitting} type="submit">
                  <Save className="h-4 w-4" />
                  保存项目
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={FADE_IN_UP}>
          <Card className="min-h-[600px] border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="border-b border-border/40 pb-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>项目目录</CardTitle>
                    <CardDescription>当前可用项目共 {events.length} 个。</CardDescription>
                  </div>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    className="h-10 rounded-full border-border/40 bg-surface/50 pl-10"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="搜索项目名称..."
                    value={searchTerm}
                  />
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
                  {filteredEvents.map((event) => (
                    <motion.div key={eventIdentity(event)} variants={FADE_IN_UP}>
                      <Card className="h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5">
                        <CardContent className="flex h-full flex-col gap-4 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                              <Trophy className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                              <Waves className="h-3.5 w-3.5" />
                              {event.poolLengthM}m
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-lg font-black tracking-tight text-foreground">
                              {event.displayName}
                            </h3>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted/60">
                              {strokeLabel(event.stroke)} · {event.distanceM} 米
                            </div>
                          </div>
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
