"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function Field({
  children,
  label,
  className,
  error,
  hint,
  labelFor,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  error?: string;
  hint?: string;
  labelFor?: string;
}) {
  const fallbackId = React.useId();
  let control = children;
  let htmlFor: string | undefined = labelFor;

  if (!labelFor && React.isValidElement<{ id?: string; className?: string }>(children)) {
    htmlFor = children.props.id ?? fallbackId;
    control = React.cloneElement(children, {
      id: htmlFor,
      className: cn(
        children.props.className,
        error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10",
      ),
    });
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between px-1">
        <Label
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
            error ? "text-rose-500" : "text-muted/60",
          )}
          htmlFor={htmlFor}
        >
          {label}
        </Label>
        {hint && !error ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted/40">
            {hint}
          </span>
        ) : null}
      </div>

      {control}

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            animate={{ opacity: 1, height: "auto", y: 0 }}
            className="px-1 text-[10px] font-bold uppercase tracking-wider text-rose-500"
            exit={{ opacity: 0, height: 0, y: -5 }}
            initial={{ opacity: 0, height: 0, y: -5 }}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  className,
  error,
  hint,
  placeholder = "请选择",
  disabled = false,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const triggerId = React.useId();

  return (
    <Field className={className} error={error} hint={hint} label={label} labelFor={triggerId}>
      <Select disabled={disabled} onValueChange={onChange} value={value}>
        <SelectTrigger className={cn(error && "border-rose-500 focus:ring-rose-500/10")} id={triggerId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
