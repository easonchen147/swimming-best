"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminEvent, listAdminEvents } from "@/lib/api/admin";
import type { EventDefinition } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [form, setForm] = useState({
    poolLengthM: 25,
    distanceM: 25,
    stroke: "freestyle",
    effortType: "sprint",
    displayName: "",
  });

  useEffect(() => {
    listAdminEvents().then((response) => setEvents(response.events));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await createAdminEvent(form);
      setEvents((current) => [...current, created]);
      setForm({
        poolLengthM: 25,
        distanceM: 25,
        stroke: "freestyle",
        effortType: "sprint",
        displayName: "",
      });
      toast.success("结构化项目已创建");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败");
    }
  }

  return (
    <AdminShell description="PB 和曲线对比都依赖结构化项目，不要靠自由文本拼项目名。" title="项目管理">
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-primary">新建结构化项目</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Field label="泳池长度">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, poolLengthM: Number(event.target.value) }))}
                type="number"
                value={form.poolLengthM}
              />
            </Field>
            <Field label="项目距离">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, distanceM: Number(event.target.value) }))}
                type="number"
                value={form.distanceM}
              />
            </Field>
            <Field label="泳姿">
              <select
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary"
                onChange={(event) => setForm((current) => ({ ...current, stroke: event.target.value }))}
                value={form.stroke}
              >
                <option value="freestyle">自由泳</option>
                <option value="breaststroke">蛙泳</option>
                <option value="backstroke">仰泳</option>
                <option value="butterfly">蝶泳</option>
                <option value="medley">混合泳</option>
              </select>
            </Field>
            <Field label="类型">
              <select
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary"
                onChange={(event) => setForm((current) => ({ ...current, effortType: event.target.value }))}
                value={form.effortType}
              >
                <option value="sprint">冲刺</option>
                <option value="pace">配速</option>
                <option value="technique">技术测试</option>
                <option value="endurance">耐力</option>
                <option value="race">比赛</option>
              </select>
            </Field>
            <Field label="显示名称（可留空自动生成）">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                value={form.displayName}
              />
            </Field>
            <Button className="w-full" type="submit">
              保存项目
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-primary">当前项目库</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {events.map((event) => (
              <Card className="bg-white/92" key={event.id}>
                <div className="text-lg font-semibold text-primary">{event.displayName}</div>
                <div className="mt-2 text-sm text-muted">
                  {event.poolLengthM}m 泳池 · {event.distanceM}m · {event.stroke} · {event.effortType}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
