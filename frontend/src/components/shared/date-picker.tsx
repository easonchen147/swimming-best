"use client";

import * as Popover from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const triggerClassName =
  "flex h-11 w-full items-center justify-between rounded-2xl border border-border/60 bg-surface-strong/90 px-4 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10";

function formatDateLabel(value: string) {
  if (!value) {
    return "请选择日期";
  }
  return format(parseISO(value), "yyyy年MM月dd日");
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "请选择日期",
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label={ariaLabel ?? placeholder}
          className={cn(triggerClassName, className)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className={cn(!value && "text-muted")}>
              {value ? formatDateLabel(value) : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-50 w-80 rounded-3xl border border-border/60 bg-surface-strong p-4 shadow-2xl shadow-primary/10 backdrop-blur-2xl"
          sideOffset={8}
        >
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted/50">
              选择日期
            </div>
            <Input
              className="h-11 rounded-2xl"
              onChange={(event) => onChange(event.target.value)}
              type="date"
              value={value}
            />
            <div className="flex gap-2">
              <button
                className="rounded-full border border-border/60 px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                onClick={() => onChange(new Date().toISOString().split("T")[0])}
                type="button"
              >
                今天
              </button>
              <button
                className="rounded-full border border-border/60 px-4 py-2 text-xs font-bold text-muted transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => onChange("")}
                type="button"
              >
                清空
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function YearPickerInput({
  value,
  onChange,
  className,
  ariaLabel,
  startYear,
  endYear,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  startYear?: number;
  endYear?: number;
}) {
  const currentYear = new Date().getFullYear();
  const maxYear = endYear ?? currentYear;
  const minYear = startYear ?? currentYear - 25;
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => String(maxYear - index),
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label={ariaLabel ?? "出生年份"}
          className={cn(triggerClassName, className)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className={cn(!value && "text-muted")}>
              {value ? `${value} 年` : "请选择年份"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-50 w-[320px] rounded-3xl border border-border/60 bg-surface-strong p-4 shadow-2xl shadow-primary/10 backdrop-blur-2xl"
          sideOffset={8}
        >
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted/50">
              选择出生年份
            </div>
            <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1">
              {years.map((year) => (
                <button
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-sm font-bold transition-all",
                    year === value
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-border/60 bg-white/70 text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                  )}
                  key={year}
                  onClick={() => onChange(year)}
                  type="button"
                >
                  {year}
                </button>
              ))}
            </div>
            <button
              className="rounded-full border border-border/60 px-4 py-2 text-xs font-bold text-muted transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onChange("")}
              type="button"
            >
              清空
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
