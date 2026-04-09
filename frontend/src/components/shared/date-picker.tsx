"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const triggerClassName = cn(
  "w-full justify-start text-left font-normal",
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
    <div className={className}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={label}
            className={cn(triggerClassName, !selectedDate && "text-muted")}
            type="button"
            variant="outline"
          >
            {selectedDate ? formatDateLabel(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            captionLayout="dropdown"
            defaultMonth={selectedDate}
            endMonth={endMonth}
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
    <div className={className}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={label}
            className={cn(triggerClassName, !value && "text-muted")}
            type="button"
            variant="outline"
          >
            {formatYearLabel(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            captionLayout="dropdown"
            className="w-[320px] sm:w-[360px]"
            defaultMonth={displayMonth}
            endMonth={new Date(maxYear, 11, 31)}
            mode="single"
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
    </div>
  );
}
