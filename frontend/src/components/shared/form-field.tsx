"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function Field({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted/80 ml-1">{label}</Label>
      {children}
    </div>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <Select
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
