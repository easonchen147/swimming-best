"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field, SelectField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { AdminPerformance, AdminSwimmer, EventDefinition } from "@/lib/types";

export default function AdminRecordsPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [recentPerformances, setRecentPerformances] = useState<AdminPerformance[]>([]);
  const [quickForm, setQuickForm] = useState({
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
    sourceType: "test",
    performedOn: "",
  });
  const [contextForm, setContextForm] = useState({
    sourceType: "competition",
    title: "",
    performedOn: "",
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
      },
    );
  }, []);

  async function refreshPerformances() {
    const response = await listAdminPerformances();
    setRecentPerformances(response.performances);
  }

  async function submitQuickRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await quickRecordPerformance({
        ...quickForm,
        timeMs: Number(quickForm.timeMs),
      });
      await refreshPerformances();
      toast.success("单条成绩已录入");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    }
  }

  async function submitContextRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      toast.success("上下文成绩已录入");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    }
  }

  return (
    <AdminShell description="既支持临时单条录入，也支持先建一次训练/比赛再挂多条成绩。" title="成绩录入">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-primary">单条快速录入</h2>
          <form className="mt-5 space-y-4" onSubmit={submitQuickRecord}>
            <SelectField
              label="孩子"
              onChange={(value) => setQuickForm((current) => ({ ...current, swimmerId: value }))}
              options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
              value={quickForm.swimmerId}
            />
            <SelectField
              label="项目"
              onChange={(value) => setQuickForm((current) => ({ ...current, eventId: value }))}
              options={events.map((item) => ({ label: item.displayName, value: item.id }))}
              value={quickForm.eventId}
            />
            <Field label="成绩（毫秒）">
              <Input
                onChange={(event) => setQuickForm((current) => ({ ...current, timeMs: Number(event.target.value) }))}
                type="number"
                value={quickForm.timeMs}
              />
            </Field>
            <SelectField
              label="来源类型"
              onChange={(value) => setQuickForm((current) => ({ ...current, sourceType: value }))}
              options={[
                { label: "训练", value: "training" },
                { label: "测试", value: "test" },
                { label: "比赛", value: "competition" },
                { label: "临时记录", value: "single" },
              ]}
              value={quickForm.sourceType}
            />
            <Field label="日期">
              <Input
                onChange={(event) => setQuickForm((current) => ({ ...current, performedOn: event.target.value }))}
                type="date"
                value={quickForm.performedOn}
              />
            </Field>
            <Button className="w-full" type="submit">
              录入单条成绩
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-primary">训练 / 比赛上下文录入</h2>
          <form className="mt-5 space-y-4" onSubmit={submitContextRecord}>
            <SelectField
              label="上下文类型"
              onChange={(value) => setContextForm((current) => ({ ...current, sourceType: value }))}
              options={[
                { label: "训练", value: "training" },
                { label: "测试", value: "test" },
                { label: "比赛", value: "competition" },
              ]}
              value={contextForm.sourceType}
            />
            <Field label="标题">
              <Input
                onChange={(event) => setContextForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="例如：四月月测 / 春季比赛"
                value={contextForm.title}
              />
            </Field>
            <Field label="日期">
              <Input
                onChange={(event) => setContextForm((current) => ({ ...current, performedOn: event.target.value }))}
                type="date"
                value={contextForm.performedOn}
              />
            </Field>
            <SelectField
              label="孩子"
              onChange={(value) => setContextForm((current) => ({ ...current, swimmerId: value }))}
              options={swimmers.map((swimmer) => ({ label: describeSwimmer(swimmer), value: swimmer.id }))}
              value={contextForm.swimmerId}
            />
            <SelectField
              label="项目"
              onChange={(value) => setContextForm((current) => ({ ...current, eventId: value }))}
              options={events.map((item) => ({ label: item.displayName, value: item.id }))}
              value={contextForm.eventId}
            />
            <Field label="成绩（毫秒）">
              <Input
                onChange={(event) => setContextForm((current) => ({ ...current, timeMs: Number(event.target.value) }))}
                type="number"
                value={contextForm.timeMs}
              />
            </Field>
            <Button className="w-full" type="submit" variant="secondary">
              录入上下文成绩
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-primary">最近录入</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {recentPerformances.map((performance) => (
            <Card className="bg-white/92" key={performance.id}>
              <div className="text-lg font-semibold text-primary">
                {describeSwimmer(performance.swimmer)}
              </div>
              <div className="mt-2 text-sm text-muted">
                {performance.event.displayName} · {performance.performedOn}
              </div>
              {performance.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {performance.tags.map((tag) => (
                    <span
                      className="rounded-full border border-primary/10 px-3 py-1 text-xs font-semibold text-primary/70"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 text-2xl font-semibold text-primary">
                {formatTimeMS(performance.timeMs)}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
