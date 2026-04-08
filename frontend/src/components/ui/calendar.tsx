"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("bg-surface-strong/95 p-3", className)}
      classNames={{
        root: "w-full",
        months: "flex w-full flex-col gap-4",
        month: "flex w-full flex-col gap-4",
        month_caption: "relative flex min-h-8 items-center justify-center px-8 pt-1",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "absolute inset-x-0 top-1 flex items-center justify-between px-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8 rounded-xl border border-border/50 bg-background/80 text-foreground hover:bg-surface",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8 rounded-xl border border-border/50 bg-background/80 text-foreground hover:bg-surface",
        ),
        dropdowns: "flex items-center gap-2",
        dropdown_root:
          "relative overflow-hidden rounded-xl border border-border/50 bg-background/80",
        dropdown:
          "h-9 appearance-none bg-transparent px-3 pr-8 text-sm font-semibold text-foreground outline-none",
        chevron: "pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted",
        month_grid: "w-full border-collapse",
        weekdays: "mt-2 flex",
        weekday:
          "w-9 rounded-md text-[10px] font-black uppercase tracking-[0.16em] text-muted/60",
        week: "mt-1 flex w-full",
        day: "h-9 w-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-9 w-9 rounded-xl border border-transparent p-0 font-semibold text-foreground aria-selected:opacity-100",
        ),
        selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        today: "border border-primary/30 bg-primary/5 text-primary",
        outside:
          "text-muted/35 aria-selected:bg-primary/10 aria-selected:text-muted/70",
        disabled: "text-muted/25 opacity-100",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
