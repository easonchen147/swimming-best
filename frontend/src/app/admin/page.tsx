"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import {
  getAdminMe,
  listAdminEvents,
  listAdminSwimmers,
  listAdminTeams,
} from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const [username, setUsername] = useState("");
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminMe(), listAdminSwimmers(), listAdminEvents(), listAdminTeams()])
      .then(([me, swimmers, events, teams]) => {
        setUsername(me.username);
        setSwimmerCount(swimmers.swimmers.length);
        setEventCount(events.events.length);
        setTeamCount(teams.teams.length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell
      description="先看整体数量，再决定今天要录成绩、建目标，还是整理公开展示页。"
      title="后台概览"
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <LoadingState label="管理员" />
          <LoadingState label="孩子档案" />
          <LoadingState label="结构化项目" />
          <LoadingState label="队伍数量" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="当前管理员" value={username} caption="登录态已经由后端 Cookie 接管" />
          <MetricCard label="孩子档案" value={`${swimmerCount}`} caption="可在“孩子”页面继续新增和维护" />
          <MetricCard label="结构化项目" value={`${eventCount}`} caption="建议先把常用项目录完整，再开始批量录成绩" />
          <MetricCard label="受管队伍" value={`${teamCount}`} caption="所有队伍都由管理员动态维护，并贯穿后台与公开展示" />
        </div>
      )}

      <Card>
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
          Recommended Workflow
        </div>
        <ol className="mt-4 space-y-3 text-sm text-muted">
          <li>1. 先在“队伍”里维护受管队伍，再到“孩子”里分配归属。</li>
          <li>2. 在“项目”里把 25 自冲刺、50 自、25 蛙等结构化项目建好。</li>
          <li>3. 到“成绩”页面录单条或整次训练/比赛。</li>
          <li>4. 在“目标”页面为重要项目设短期和长期目标。</li>
        </ol>
      </Card>
    </AdminShell>
  );
}
