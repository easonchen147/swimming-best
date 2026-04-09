"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  formatters: formattersProp,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const isDropdownLayout = props.captionLayout?.startsWith("dropdown");
  const navLayout = props.navLayout ?? (isDropdownLayout ? "around" : undefined);
  const formatters = {
    formatMonthDropdown: (date: Date) => String(date.getMonth() + 1),
    formatYearDropdown: (date: Date) => String(date.getFullYear()),
    ...formattersProp,
  };

  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        root: cn("relative w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4", defaultClassNames.months),
        month: cn("relative flex w-full flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "relative flex h-8 items-center justify-center px-8",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          "flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium",
          isDropdownLayout && "pointer-events-none",
          defaultClassNames.caption_label,
        ),
        nav: cn(
          "absolute inset-x-0 top-0 flex items-center justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute left-0 top-0 z-10 size-8 bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute right-0 top-0 z-10 size-8 bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames.button_next,
        ),
        dropdowns: cn(
          "flex h-8 items-center justify-center gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn("relative inline-flex items-center", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        chevron: cn("size-4", defaultClassNames.chevron),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("mt-2 flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn("size-8 p-0 text-center text-sm", defaultClassNames.day),
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 rounded-md p-0 font-normal aria-selected:opacity-100",
          defaultClassNames.day_button,
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaultClassNames.selected,
        ),
        today: cn("bg-accent text-accent-foreground", defaultClassNames.today),
        outside: cn(
          "text-muted-foreground opacity-50 aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : orientation === "down" ? (
            <ChevronRight
              className={cn("h-4 w-4 rotate-90", iconClassName)}
              {...iconProps}
            />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      formatters={formatters}
      navLayout={navLayout}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
