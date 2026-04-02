"use client";

import Link from "next/link";
import { ArrowRight, Radar, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listPublicSwimmers } from "@/lib/api/public";
import { listTeams } from "@/lib/swimmer-label";
import type { PublicSwimmerSummary } from "@/lib/types";

export default function HomePage() {
  const [swimmers, setSwimmers] = useState<PublicSwimmerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("");

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => setSwimmers(response.swimmers))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const teams = listTeams(swimmers);
  const visibleSwimmers = teamFilter
    ? swimmers.filter((swimmer) => swimmer.teamId === teamFilter)
    : swimmers;

  return (
    <PublicShell className="gap-6">
      <section className="panel-glow relative overflow-hidden rounded-[32px] border border-primary/8 bg-surface px-5 py-6 md:px-8 md:py-9">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)] md:block" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary/65">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            PB · 趋势 · 目标 · 分享
          </div>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-primary md:text-6xl">
            把每一次游进的秒数，变成看得见的成长曲线。
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
            记录多个孩子的游泳成绩，自动识别 PB、追踪阶段进步、设定短中长期目标，并在手机或电脑上一眼看到谁正在稳定进步。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/compare">
              <Button size="lg">
                查看多人对比
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="secondary">
                打开管理后台
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <LoadingState label="公开孩子" />
            <LoadingState label="同项目对比" />
            <LoadingState label="移动端查看" />
          </>
        ) : (
          <>
            <MetricCard
              label="公开孩子"
              value={`${visibleSwimmers.length}`}
              caption="已开放查看的孩子档案数量"
            />
            <MetricCard
              label="对比准备"
              value={`${visibleSwimmers.filter((item) => item.strongestEventId).length}`}
              caption="已经具备主项目成绩的孩子数量"
            />
            <MetricCard
              label="访问场景"
              value="PC + 手机"
              caption="页面从首版开始即支持桌面端与移动端"
            />
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)]">
        <Card className="flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
              Swimmer Directory
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-primary">
              公开成绩档案
            </h2>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                teamFilter === ""
                  ? "border-primary bg-primary text-white"
                  : "border-primary/12 bg-white text-primary hover:bg-primary/6"
              }`}
              onClick={() => setTeamFilter("")}
              type="button"
            >
              全部队伍
            </button>
            {teams.map((team) => (
              <button
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  teamFilter === team.id
                    ? "border-primary bg-primary text-white"
                    : "border-primary/12 bg-white text-primary hover:bg-primary/6"
                }`}
                key={team.id}
                onClick={() => setTeamFilter(team.id)}
                type="button"
              >
                {team.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {visibleSwimmers.map((swimmer) => (
              <Link href={`/swimmers/${swimmer.slug}`} key={swimmer.id}>
                <Card className="h-full bg-white/92 transition hover:-translate-y-0.5 hover:border-primary/20">
                  <div className="font-mono text-xs uppercase tracking-[0.18em] text-primary/50">
                    公开档案
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-primary">
                    {swimmer.displayName}
                  </div>
                  {swimmer.team ? (
                    <div className="mt-2 inline-flex rounded-full border border-primary/12 px-3 py-1 text-xs font-semibold text-primary/70">
                      {swimmer.team.name}
                    </div>
                  ) : null}
                  <div className="mt-2 text-sm text-muted">
                    查看 PB、项目成绩和阶段趋势
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    打开档案
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
                How It Works
              </div>
              <h2 className="text-xl font-semibold text-primary">你能看到什么</h2>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted">
            <p>1. 每个项目的当前最佳成绩和最近表现。</p>
            <p>2. 原始成绩点、PB 包络线和趋势线。</p>
            <p>3. 同项目下多个孩子的曲线对比。</p>
            <p>4. 距离短期或长期目标还差多少。</p>
          </div>
          <Link href="/compare">
            <Button className="w-full" variant="secondary">
              先去看对比页
            </Button>
          </Link>
        </Card>
      </section>
    </PublicShell>
  );
}
