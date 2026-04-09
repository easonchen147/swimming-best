"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const triggerClassName = cn(
  "h-11 w-full justify-start rounded-2xl border-border/60 bg-surface-strong/90 text-left font-normal",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_30px_rgba(15,23,42,0.06)]",
  "hover:border-primary/30 hover:bg-surface-strong/90",
);

function parseDateValue(value: string) {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

function formatDateLabel(value: string) {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return "请选择日期";
  }

  return format(parsed, "yyyy年M月d日", { locale: zhCN });
}

function formatYearLabel(value: string) {
  return value ? `${value} 年` : "请选择年份";
}

function ClearButton({
  ariaLabel,
  onClick,
}: {
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className="h-11 w-11 shrink-0 rounded-2xl border-border/60 bg-surface/80"
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "请选择日期",
  className,
  ariaLabel,
  startMonth,
  endMonth,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  startMonth?: Date;
  endMonth?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const label = ariaLabel ?? placeholder;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={label}
            className={cn(triggerClassName, !selectedDate && "text-muted")}
            type="button"
            variant="outline"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">
              {selectedDate ? formatDateLabel(value) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" sideOffset={8}>
          <Calendar
            captionLayout="dropdown"
            endMonth={endMonth}
            hideNavigation
            initialFocus
            locale={zhCN}
            mode="single"
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            selected={selectedDate}
            startMonth={startMonth}
          />
        </PopoverContent>
      </Popover>
      {selectedDate ? (
        <ClearButton ariaLabel={`清空${label}`} onClick={() => onChange("")} />
      ) : null}
    </div>
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
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const maxYear = endYear ?? currentYear;
  const minYear = startYear ?? currentYear - 25;
  const selectedDate = value ? new Date(Number(value), 0, 1) : undefined;
  const displayMonth = selectedDate ?? new Date(maxYear, 0, 1);
  const label = ariaLabel ?? "出生年份";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={label}
            className={cn(triggerClassName, !value && "text-muted")}
            type="button"
            variant="outline"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{formatYearLabel(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" sideOffset={8}>
          <Calendar
            captionLayout="dropdown-years"
            className="w-[320px] sm:w-[360px]"
            endMonth={new Date(maxYear, 11, 31)}
            hideNavigation
            initialFocus
            mode="single"
            month={displayMonth}
            onMonthChange={(month) => {
              onChange(String(month.getFullYear()));
              setOpen(false);
            }}
            onSelect={(date) => {
              onChange(date ? String(date.getFullYear()) : "");
              setOpen(false);
            }}
            selected={selectedDate}
            startMonth={new Date(minYear, 0, 1)}
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <ClearButton ariaLabel={`清空${label}`} onClick={() => onChange("")} />
      ) : null}
    </div>
  );
}
