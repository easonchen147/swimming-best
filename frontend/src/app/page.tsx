"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
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
      <section>
        <h1 className="text-2xl font-semibold text-primary md:text-3xl">
          游泳成绩档案
        </h1>
        <p className="mt-1 text-sm text-muted">
          选择学员查看成绩趋势、PB 记录和目标进度
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <section>
        <div className="flex flex-wrap gap-2 border-b border-primary/8 pb-3">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              teamFilter === ""
                ? "bg-primary text-white shadow-sm"
                : "text-primary/70 hover:bg-primary/6 hover:text-primary"
            }`}
            onClick={() => setTeamFilter("")}
            type="button"
          >
            全部
          </button>
          {teams.map((team) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                teamFilter === team.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-primary/70 hover:bg-primary/6 hover:text-primary"
              }`}
              key={team.id}
              onClick={() => setTeamFilter(team.id)}
              type="button"
            >
              {team.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-4">
            <LoadingState label="学员档案" />
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="mt-4 hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary/8 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="pb-3 pl-4">学员</th>
                    <th className="pb-3">队伍</th>
                    <th className="pb-3 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSwimmers.map((swimmer) => (
                    <tr
                      className="border-b border-primary/6 transition hover:bg-primary/3"
                      key={swimmer.id}
                    >
                      <td className="py-3 pl-4">
                        <span className="text-base font-semibold text-primary">
                          {swimmer.displayName}
                        </span>
                      </td>
                      <td className="py-3">
                        {swimmer.team ? (
                          <span className="inline-flex rounded-full border border-primary/10 bg-primary/4 px-3 py-0.5 text-xs font-semibold text-primary/70">
                            {swimmer.team.name}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Link
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary"
                          href={`/swimmers/${swimmer.slug}`}
                        >
                          查看档案
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="mt-4 grid gap-3 md:hidden">
              {visibleSwimmers.map((swimmer) => (
                <Link href={`/swimmers/${swimmer.slug}`} key={swimmer.id}>
                  <Card className="flex items-center justify-between bg-white/92 transition hover:-translate-y-0.5 hover:border-primary/20">
                    <div>
                      <div className="text-base font-semibold text-primary">
                        {swimmer.displayName}
                      </div>
                      {swimmer.team ? (
                        <div className="mt-1 text-xs text-muted">
                          {swimmer.team.name}
                        </div>
                      ) : null}
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary/40" />
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && visibleSwimmers.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/12 px-4 py-8 text-center text-sm text-muted">
            暂无公开档案
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
