"use client";

import { Timer } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000);
}

export function msToSeconds(ms: number): number {
  return ms / 1000;
}

export function formatSwimTime(ms: number): string {
  const totalHundredths = Math.round(ms / 10);
  const minutes = Math.floor(totalHundredths / 6000);
  const seconds = (totalHundredths % 6000) / 100;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }

  return seconds.toFixed(2);
}

export function parseShorthand(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 3) {
    return null;
  }

  const hundredths = parseInt(digits.slice(-2), 10);
  const seconds = parseInt(digits.slice(-4, -2) || "0", 10);
  const minutes = parseInt(digits.slice(0, -4) || "0", 10);

  return (minutes * 60 + seconds) * 1000 + hundredths * 10;
}

function parseSecondsInput(raw: string): { ms: number | null; error?: string } {
  const normalized = raw.trim();
  if (!normalized) {
    return { ms: null };
  }

  if (/^\d{3,}$/.test(normalized)) {
    const shorthand = parseShorthand(normalized);
    if (shorthand !== null) {
      return { ms: shorthand };
    }
  }

  if (normalized.includes(":")) {
    const parts = normalized.split(":");
    if (parts.length !== 2) {
      return { ms: null, error: "请输入合法时间，例如 32.15 或 1:05.23" };
    }

    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds >= 60
    ) {
      return { ms: null, error: "请输入合法时间，例如 32.15 或 1:05.23" };
    }

    return { ms: secondsToMs(minutes * 60 + seconds) };
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed < 0) {
    return { ms: null, error: "请输入合法时间，例如 32.15 或 1:05.23" };
  }

  return { ms: secondsToMs(parsed) };
}

function parseMillisecondsInput(raw: string): { ms: number | null; error?: string } {
  const normalized = raw.trim();
  if (!normalized) {
    return { ms: null };
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return { ms: null, error: "毫秒模式下请输入非负整数" };
  }

  return { ms: parsed };
}

function focusNextField(currentTarget: HTMLInputElement) {
  const form = currentTarget.closest("form");
  if (!form) {
    return;
  }

  const focusable = Array.from(
    form.querySelectorAll<HTMLElement>("input, select, textarea, button"),
  ).filter((element) => {
    if ("disabled" in element && element.disabled) {
      return false;
    }
    return element.tabIndex !== -1;
  });

  const currentIndex = focusable.indexOf(currentTarget);
  if (currentIndex >= 0) {
    focusable[currentIndex + 1]?.focus();
  }
}

export function TimeInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (ms: number) => void;
  className?: string;
}) {
  const [unit, setUnit] = useState<"seconds" | "ms">("seconds");
  const [inputValue, setInputValue] = useState(formatSwimTime(value));
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const displayValue =
    isFocused
      ? inputValue
      : unit === "seconds"
        ? formatSwimTime(value)
        : String(value);

  function handleChange(raw: string) {
    setInputValue(raw);
    const parsed =
      unit === "seconds" ? parseSecondsInput(raw) : parseMillisecondsInput(raw);

    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    setError("");
    if (parsed.ms !== null) {
      onChange(parsed.ms);
    }
  }

  function toggleUnit() {
    const nextUnit = unit === "seconds" ? "ms" : "seconds";
    setUnit(nextUnit);
    setError("");
    setInputValue(nextUnit === "seconds" ? formatSwimTime(value) : String(value));
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="group flex h-11 gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40 transition-colors group-focus-within:text-primary">
            <Timer className="h-4 w-4" />
          </div>
          <Input
            aria-invalid={error ? "true" : "false"}
            className={cn(
              "h-full rounded-2xl border-border/60 bg-surface-strong pl-9 font-mono font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10",
            )}
            onBlur={() => {
              setIsFocused(false);
            }}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setInputValue(
                unit === "seconds" ? formatSwimTime(value) : String(value),
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                focusNextField(event.currentTarget);
              }
            }}
            placeholder={unit === "seconds" ? "32.15 或 1:05.23" : "32150"}
            type="text"
            value={displayValue}
          />
        </div>
        <button
          className={cn(
            "min-w-[4.5rem] shrink-0 rounded-2xl border px-4 py-2 text-xs font-black transition-all",
            unit === "seconds"
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
              : "border-border bg-surface text-muted hover:border-primary/20 hover:bg-primary/5 hover:text-primary",
          )}
          onClick={toggleUnit}
          type="button"
        >
          {unit === "seconds" ? "秒" : "毫秒"}
        </button>
      </div>
      {error ? (
        <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-rose-500">
          {error}
        </p>
      ) : (
        <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted/40">
          支持输入 32.15、1:05.23 或 10523 这类快捷格式
        </p>
      )}
    </div>
  );
}
