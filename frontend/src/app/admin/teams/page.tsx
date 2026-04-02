"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAdminTeam,
  listAdminTeams,
  updateAdminTeam,
} from "@/lib/api/admin";
import type { TeamSummary } from "@/lib/types";

function sortTeams(items: TeamSummary[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    listAdminTeams().then((response) => setTeams(sortTeams(response.teams)));
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      sortOrder: "0",
      isActive: true,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: form.name,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        const team = await updateAdminTeam(editingId, payload);
        setTeams((current) =>
          sortTeams(current.map((item) => (item.id === team.id ? team : item))),
        );
        toast.success("队伍已更新");
      } else {
        const team = await createAdminTeam(payload);
        setTeams((current) => sortTeams([...current, team]));
        toast.success("队伍已创建");
      }
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存队伍失败");
    }
  }

  function startEdit(team: TeamSummary) {
    setEditingId(team.id);
    setForm({
      name: team.name,
      sortOrder: String(team.sortOrder),
      isActive: team.isActive,
    });
  }

  return (
    <AdminShell
      description="先维护受管队伍，再去给孩子分配归属。这里的队伍是实体，不是自由文本标签。"
      title="队伍管理"
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-primary">
            {editingId ? "编辑队伍" : "新建队伍"}
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Field label="队伍名称">
              <Input
                aria-label="队伍名称"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                value={form.name}
              />
            </Field>
            <Field label="排序">
              <Input
                aria-label="排序"
                inputMode="numeric"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
                value={form.sortOrder}
              />
            </Field>
            <label className="flex items-center gap-3 text-sm font-semibold text-primary">
              <input
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              队伍当前可选
            </label>
            <div className="flex gap-3">
              <Button className="flex-1" type="submit">
                {editingId ? "保存修改" : "保存队伍"}
              </Button>
              {editingId ? (
                <Button
                  className="flex-1"
                  onClick={resetForm}
                  type="button"
                  variant="secondary"
                >
                  取消编辑
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-primary">已管理队伍</h2>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-primary/55">
              {teams.length} Teams
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {teams.map((team) => (
              <Card className="bg-white/92" key={team.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-primary">{team.name}</div>
                    <div className="mt-1 text-sm text-muted">
                      排序 {team.sortOrder} · {team.isActive ? "可选" : "停用"}
                    </div>
                  </div>
                  <Button
                    onClick={() => startEdit(team)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    编辑
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
