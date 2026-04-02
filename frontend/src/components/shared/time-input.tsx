"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

export function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000);
}

export function msToSeconds(ms: number): number {
  return ms / 1000;
}

export function TimeInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (ms: number) => void;
}) {
  const [unit, setUnit] = useState<"seconds" | "ms">("seconds");
  const displayValue =
    unit === "seconds" ? msToSeconds(value).toString() : value.toString();

  function handleChange(raw: string) {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return;
    }

    onChange(unit === "seconds" ? secondsToMs(parsed) : Math.round(parsed));
  }

  function toggleUnit() {
    setUnit((current) => (current === "seconds" ? "ms" : "seconds"));
  }

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        onChange={(event) => handleChange(event.target.value)}
        step={unit === "seconds" ? "0.01" : "1"}
        type="number"
        value={displayValue}
      />
      <button
        className={`shrink-0 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
          unit === "seconds"
            ? "border-primary bg-primary text-white"
            : "border-primary/12 bg-white text-primary hover:bg-primary/6"
        }`}
        onClick={toggleUnit}
        type="button"
      >
        {unit === "seconds" ? "秒" : "毫秒"}
      </button>
    </div>
  );
}
