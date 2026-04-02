"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAdminSwimmer,
  listAdminTeams,
  listAdminSwimmers,
  updateAdminSwimmer,
} from "@/lib/api/admin";
import { describeSwimmer, listTeams } from "@/lib/swimmer-label";
import type { AdminSwimmer, TeamSummary } from "@/lib/types";

export default function AdminSwimmersPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [form, setForm] = useState({
    realName: "",
    nickname: "",
    publicNameMode: "nickname",
    isPublic: true,
    teamId: "",
  });

  useEffect(() => {
    Promise.all([listAdminSwimmers(), listAdminTeams()]).then(([swimmerResponse, teamResponse]) => {
      setSwimmers(swimmerResponse.swimmers);
      setTeams(teamResponse.teams);
      setForm((current) => ({
        ...current,
        teamId: current.teamId || teamResponse.teams[0]?.id || "",
      }));
    });
  }, []);

  const visibleTeams = teams.length > 0 ? teams : listTeams(swimmers);
  const selectableTeams = teams.filter(
    (team) => team.isActive || team.id === form.teamId,
  );
  const visibleSwimmers = teamFilter
    ? swimmers.filter((swimmer) => swimmer.teamId === teamFilter)
    : swimmers;

  function resetForm() {
    setEditingId(null);
    setForm({
      realName: "",
      nickname: "",
      publicNameMode: "nickname",
      isPublic: true,
      teamId: teams[0]?.id || "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editingId) {
        const swimmer = await updateAdminSwimmer(editingId, form);
        setSwimmers((current) =>
          current.map((item) => (item.id === swimmer.id ? swimmer : item)),
        );
        toast.success("孩子档案已更新");
      } else {
        const swimmer = await createAdminSwimmer(form);
        setSwimmers((current) => [...current, swimmer]);
        toast.success("孩子档案已创建");
      }
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败");
    }
  }

  function startEdit(swimmer: AdminSwimmer) {
    setEditingId(swimmer.id);
    setForm({
      realName: swimmer.realName,
      nickname: swimmer.nickname,
      publicNameMode: swimmer.publicNameMode,
      isPublic: swimmer.isPublic,
      teamId: swimmer.teamId,
    });
  }

  return (
    <AdminShell description="昵称和公开模式会直接决定公开页展示效果。" title="孩子管理">
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-primary">
            {editingId ? "编辑孩子档案" : "新建孩子档案"}
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Field label="真实姓名">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, realName: event.target.value }))}
                value={form.realName}
              />
            </Field>
            <Field label="公开昵称">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                value={form.nickname}
              />
            </Field>
            <Field label="所属队伍">
              <select
                aria-label="所属队伍"
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary"
                onChange={(event) =>
                  setForm((current) => ({ ...current, teamId: event.target.value }))
                }
                value={form.teamId}
              >
                {teams.length === 0 ? (
                  <option value="">请先到“队伍”页面创建队伍</option>
                ) : null}
                {selectableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                    {!team.isActive ? "（停用）" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="公开模式">
              <select
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary"
                onChange={(event) => setForm((current) => ({ ...current, publicNameMode: event.target.value }))}
                value={form.publicNameMode}
              >
                <option value="nickname">公开昵称</option>
                <option value="real_name">公开真实姓名</option>
                <option value="hidden">仅管理员可见</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 text-sm font-semibold text-primary">
              <input
                checked={form.isPublic}
                onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))}
                type="checkbox"
              />
              公开展示该孩子
            </label>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={teams.length === 0} type="submit">
                {editingId ? "保存修改" : "保存档案"}
              </Button>
              {editingId ? (
                <Button className="flex-1" onClick={resetForm} type="button" variant="secondary">
                  取消编辑
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-primary">已录入孩子</h2>
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
              {visibleTeams.map((team) => (
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
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {visibleSwimmers.map((swimmer) => (
              <Card className="bg-white/92" key={swimmer.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-primary">
                      {describeSwimmer(swimmer)}
                    </div>
                    <div className="mt-1 text-sm text-muted">{swimmer.realName}</div>
                  </div>
                  <Button onClick={() => startEdit(swimmer)} size="sm" type="button" variant="secondary">
                    编辑
                  </Button>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/55">
                  {swimmer.publicNameMode} · {swimmer.isPublic ? "公开" : "隐藏"}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
