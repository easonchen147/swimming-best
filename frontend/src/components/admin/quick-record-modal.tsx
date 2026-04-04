"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Save, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Field, SelectField } from "@/components/shared/form-field";
import { TimeInput } from "@/components/shared/time-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listAdminEvents,
  listAdminSwimmers,
  quickRecordPerformance,
} from "@/lib/api/admin";
import { describeSwimmer } from "@/lib/swimmer-label";
import type { AdminSwimmer, EventDefinition } from "@/lib/types";

export function QuickRecordModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    swimmerId: "",
    eventId: "",
    timeMs: 15000,
    sourceType: "test",
    performedOn: new Date().toISOString().split("T")[0],
    tags: "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    Promise.all([listAdminSwimmers(), listAdminEvents()])
      .then(([swimmersResponse, eventsResponse]) => {
        setSwimmers(swimmersResponse.swimmers);
        setEvents(eventsResponse.events);
        setForm((current) => ({
          ...current,
          swimmerId: current.swimmerId || swimmersResponse.swimmers[0]?.id || "",
          eventId: current.eventId || eventsResponse.events[0]?.id || "",
        }));
      })
      .catch((error: Error) => toast.error(error.message));
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await quickRecordPerformance({
        ...form,
        timeMs: Number(form.timeMs),
        tags: form.tags
          .split(/[;,；，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setSuccess(true);
      toast.success("成绩录入成功");
      onSuccess?.();

      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 900);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "录入失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
              >
                <div className="glass-card overflow-hidden bg-surface-strong shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border/40 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-black tracking-tight text-foreground">
                          快速成绩录入
                        </Dialog.Title>
                        <Dialog.Description className="text-xs font-bold uppercase tracking-widest text-muted/60">
                          Quick Record Entry
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <Button className="rounded-full" size="icon" variant="ghost">
                        <X className="h-5 w-5" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  <form className="space-y-5 p-6" onSubmit={handleSubmit}>
                    <SelectField
                      hint="Ctrl/Cmd + K"
                      label="孩子姓名"
                      onChange={(value) => setForm((current) => ({ ...current, swimmerId: value }))}
                      options={swimmers.map((swimmer) => ({
                        label: describeSwimmer(swimmer),
                        value: swimmer.id,
                      }))}
                      value={form.swimmerId}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="项目"
                        onChange={(value) => setForm((current) => ({ ...current, eventId: value }))}
                        options={events.map((item) => ({
                          label: item.displayName,
                          value: item.id,
                        }))}
                        value={form.eventId}
                      />

                      <Field label="录入成绩">
                        <TimeInput
                          onChange={(ms) => setForm((current) => ({ ...current, timeMs: ms }))}
                          value={form.timeMs}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="数据来源"
                        onChange={(value) => setForm((current) => ({ ...current, sourceType: value }))}
                        options={[
                          { label: "训练", value: "training" },
                          { label: "测试", value: "test" },
                          { label: "比赛", value: "competition" },
                        ]}
                        value={form.sourceType}
                      />

                      <Field label="发生日期">
                        <Input
                          className="h-11 rounded-2xl"
                          onChange={(event) =>
                            setForm((current) => ({ ...current, performedOn: event.target.value }))
                          }
                          type="date"
                          value={form.performedOn}
                        />
                      </Field>
                    </div>

                    <Field hint="可选" label="标签（分号或逗号分隔）">
                      <Input
                        className="h-11 rounded-2xl"
                        onChange={(event) =>
                          setForm((current) => ({ ...current, tags: event.target.value }))
                        }
                        placeholder="例如：月测；主项；出发练习"
                        value={form.tags}
                      />
                    </Field>

                    <Button
                      className="mt-4 h-12 w-full rounded-2xl"
                      disabled={!form.swimmerId || !form.eventId}
                      loading={submitting}
                      success={success}
                      type="submit"
                    >
                      <Save className="h-4 w-4" />
                      立即保存
                    </Button>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
