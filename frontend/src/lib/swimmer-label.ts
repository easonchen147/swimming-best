import type { TeamSummary } from "@/lib/types";

type SwimmerLike = {
  nickname?: string;
  realName?: string;
  displayName?: string;
  team?: Pick<TeamSummary, "id" | "name">;
};

export function describeSwimmer(swimmer: SwimmerLike) {
  const baseName =
    swimmer.displayName || swimmer.nickname || swimmer.realName || "未命名孩子";

  if (!swimmer.team?.name) {
    return baseName;
  }

  return `${baseName} · ${swimmer.team.name}`;
}

export function listTeams(items: Array<{ team?: TeamSummary }>) {
  const teams = new Map<string, TeamSummary>();

  for (const item of items) {
    if (!item.team) {
      continue;
    }
    teams.set(item.team.id, item.team);
  }

  return [...teams.values()].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}
