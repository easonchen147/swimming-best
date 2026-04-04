"use client";

import * as React from "react";

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
  const fallbackId = React.useId();
  let control = children;
  let htmlFor: string | undefined;

  if (React.isValidElement<{ id?: string }>(children)) {
    htmlFor = children.props.id ?? fallbackId;
    control = React.cloneElement(children, { id: htmlFor });
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label
        className="ml-1 text-xs font-bold uppercase tracking-wider text-muted/80"
        htmlFor={htmlFor}
      >
        {label}
      </Label>
      {control}
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
  const id = React.useId();

  return (
    <Field className={className} label={label}>
      <Select id={id} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
