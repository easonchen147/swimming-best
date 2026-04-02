const sourceTypeConfig: Record<string, { label: string; className: string }> = {
  competition: {
    label: "比赛",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  training: {
    label: "训练",
    className: "border-primary/10 bg-primary/4 text-primary/70",
  },
  test: {
    label: "测试",
    className: "border-slate-200 bg-slate-50 text-slate-500",
  },
  single: {
    label: "临时",
    className: "border-slate-100 bg-white text-slate-400",
  },
};

export function SourceTypeBadge({ sourceType }: { sourceType?: string }) {
  const config = sourceTypeConfig[sourceType ?? ""] ?? sourceTypeConfig.single;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight ${config.className}`}
    >
      {config.label}
    </span>
  );
}
