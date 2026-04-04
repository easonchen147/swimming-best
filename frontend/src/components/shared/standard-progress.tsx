import { formatTimeMS } from "@/lib/format";
import type { NextCustomBenchmark } from "@/lib/types";

export function StandardProgress({
  nextStandard,
}: {
  nextStandard: NextCustomBenchmark | null;
}) {
  if (!nextStandard) {
    return <div className="text-sm text-muted">已达到当前自定义标准最高线。</div>;
  }

  return (
    <div className="text-sm text-muted">
      距离
      <span className="mx-1 font-semibold text-primary">{nextStandard.name}</span>
      还差
      <span className="mx-1 font-semibold text-primary">
        {formatTimeMS(nextStandard.gapMs)}
      </span>
    </div>
  );
}
