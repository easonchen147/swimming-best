"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field, SelectField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createGoal,
  listAdminEvents,
  listAdminGoals,
  listAdminSwimmers,
} from "@/lib/api/admin";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import type { AdminGoal, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminGoalsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [form, setForm] = useState({
    swimmerId: "",
    eventId: "",
    horizon: "short",
    title: "",
    targetTimeMs: 14500,
    targetDate: "",
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
      },
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    }
  }

  return (
    <AdminShell description="给具体项目设短、中、长期目标，后台会自动把当前最好成绩当作基线。" title="目标管理">
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-primary">创建目标</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <SelectField
              label="孩子"
              onChange={(value) => setForm((current) => ({ ...current, swimmerId: value }))}
              options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
              value={form.swimmerId}
            />
            <SelectField
              label="项目"
              onChange={(value) => setForm((current) => ({ ...current, eventId: value }))}
              options={events.map((item) => ({ label: item.displayName, value: item.id }))}
              value={form.eventId}
            />
            <SelectField
              label="目标层级"
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
                placeholder="例如：6 月前游进 14.50"
                value={form.title}
              />
            </Field>
            <Field label="目标成绩（毫秒）">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, targetTimeMs: Number(event.target.value) }))}
                type="number"
                value={form.targetTimeMs}
              />
            </Field>
            <Field label="目标日期">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, targetDate: event.target.value }))}
                type="date"
                value={form.targetDate}
              />
            </Field>
            <Button className="w-full" type="submit">
              保存目标
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-primary">已创建目标</h2>
          <div className="mt-5 space-y-3">
            {goals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/12 px-4 py-4 text-sm text-muted">
                还没有新建目标，创建后这里会立即显示返回结果。
              </div>
            ) : (
              goals.map((goal) => (
                <Card className="bg-white/92" key={goal.id}>
                  <div className="text-lg font-semibold text-primary">{goal.title}</div>
                  <div className="mt-2 text-sm text-muted">
                    基线 {formatTimeMS(goal.baselineTimeMs)} → 目标 {formatTimeMS(goal.targetTimeMs)}
                  </div>
                  {goal.swimmer ? (
                    <div className="mt-2 text-sm text-muted">
                      {describeSwimmer(goal.swimmer)} · {goal.event?.displayName}
                    </div>
                  ) : null}
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-primary/55">
                    {goal.horizon} · {goal.targetDate}
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
