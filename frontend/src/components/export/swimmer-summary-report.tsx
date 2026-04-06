"use client";

import { Award, Download, Flag, TimerReset, TrendingUp, Users, Waves } from "lucide-react";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatProgress, formatTimeMS } from "@/lib/format";
import type { SwimmerSummaryExport } from "@/lib/types";

function ageBucketLabel(ageBucket: string) {
  switch (ageBucket) {
    case "u8":
      return "U8";
    case "u10":
      return "U10";
    case "u12":
      return "U12";
    case "u14":
      return "U14";
    case "u16_plus":
      return "U16+";
    default:
      return "未知年龄";
  }
}

export function SwimmerSummaryReport({ summary }: { summary: SwimmerSummaryExport }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function exportCard() {
    if (!cardRef.current) {
      return;
    }

    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#f8fafc",
      });
      const link = document.createElement("a");
      link.download = `${summary.swimmer.displayName}-summary.png`;
      link.href = dataUrl;
      link.click();
      toast.success("成绩简报已保存");
    } catch {
      toast.error("保存失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" variant="solid">
            Summary Export
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground">成绩简报模板</h1>
          <p className="max-w-2xl text-sm font-medium text-muted">
            用一页读懂当前队员的代表性成绩、国家等级、目标里程碑和近期进步亮点。
          </p>
        </div>

        <Button className="rounded-full px-6" loading={exporting} onClick={exportCard}>
          <Download className="h-4 w-4" />
          保存简报
        </Button>
      </div>

      <div ref={cardRef}>
        <Card className="overflow-hidden border-border/40 shadow-xl shadow-primary/5">
          <CardContent className="space-y-8 p-8 md:p-10">
            <div className="flex flex-col gap-6 rounded-[32px] bg-primary px-8 py-10 text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/65">
                <Waves className="h-4 w-4" />
                <span>Swimming Best Highlight Profile</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tight">{summary.swimmer.displayName}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white/70">
                  <span>{summary.swimmer.team.name}</span>
                  <span>·</span>
                  <span>{ageBucketLabel(summary.swimmer.ageBucket)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard icon={<Award className="h-5 w-5" />} label="强项数" value={`${summary.summary.strongestEventCount}`} />
              <MetricCard icon={<Flag className="h-5 w-5" />} label="已达成目标" value={`${summary.summary.achievedGoalCount}`} />
              <MetricCard icon={<TimerReset className="h-5 w-5" />} label="30天进步" value={formatTimeMS(summary.summary.standoutProgress30dMs)} />
              <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="90天进步" value={formatTimeMS(summary.summary.standoutProgress90dMs)} />
            </div>

            <div className="space-y-4">
              <div className="text-xl font-black text-foreground">突出项目</div>
              <div className="grid gap-4 md:grid-cols-3">
                {summary.highlights.map((highlight) => (
                  <Card className="border-border/40 shadow-sm" key={highlight.eventId}>
                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-foreground">{highlight.eventDisplayName}</div>
                        <div className="text-3xl font-black tracking-tight text-primary">
                          {formatTimeMS(highlight.bestTimeMs)}
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-muted">
                        <div>国家等级：{highlight.officialGradeLabel ?? "待达级"}</div>
                        <div>
                          下一等级：
                          {highlight.nextOfficialGradeLabel
                            ? `${highlight.nextOfficialGradeLabel} · 差 ${formatTimeMS(highlight.nextOfficialGradeGapMs ?? 0)}`
                            : "已达当前最高可判定等级"}
                        </div>
                        <div>30天进步：{formatTimeMS(highlight.progress30dMs)}</div>
                        <div>90天进步：{formatTimeMS(highlight.progress90dMs)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xl font-black text-foreground">目标与里程碑</div>
              <div className="grid gap-4">
                {summary.goals.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border/60 bg-surface/30 p-6 text-sm text-muted">
                    当前还没有可展示的目标或里程碑。
                  </div>
                ) : (
                  summary.goals.map((goal) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-[24px] border border-border/40 bg-surface/30 p-5"
                      key={goal.id}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-black text-foreground">{goal.title}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                          {goal.horizon} · 截止 {goal.targetDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-primary">
                          {goal.isAchieved ? "已达成" : `还差 ${formatTimeMS(goal.gapMs)}`}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                          进度 {formatProgress(goal.progress)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border/40 pt-6 text-xs font-bold uppercase tracking-[0.28em] text-muted/50">
              <Users className="h-4 w-4" />
              <span>Swimming Best Summary Export</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
          {label}
        </div>
        <div className="text-2xl font-black text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
