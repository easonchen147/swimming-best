import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  AdminGoal,
  AdminPerformance,
  AdminSwimmer,
  EventDefinition,
  TeamSummary,
} from "@/lib/types";

export function loginAdmin(input: { username: string; password: string }) {
  return apiPost<{ username: string }>("/api/admin/login", input);
}

export function logoutAdmin() {
  return apiPost<void>("/api/admin/logout");
}

export function getAdminMe() {
  return apiGet<{ username: string }>("/api/admin/me");
}

export function listAdminTeams() {
  return apiGet<{ teams: TeamSummary[] }>("/api/admin/teams");
}

export function createAdminTeam(input: {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return apiPost<TeamSummary>("/api/admin/teams", input);
}

export function updateAdminTeam(
  teamId: string,
  input: {
    name: string;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  return apiPatch<TeamSummary>(`/api/admin/teams/${teamId}`, input);
}

export function listAdminSwimmers(teamId?: string) {
  const params = new URLSearchParams();
  if (teamId) {
    params.set("teamId", teamId);
  }

  return apiGet<{ swimmers: AdminSwimmer[] }>(
    `/api/admin/swimmers${params.size > 0 ? `?${params.toString()}` : ""}`,
  );
}

export function createAdminSwimmer(input: {
  realName: string;
  nickname: string;
  publicNameMode: string;
  isPublic: boolean;
  teamId: string;
}) {
  return apiPost<AdminSwimmer>("/api/admin/swimmers", input);
}

export function updateAdminSwimmer(
  swimmerId: string,
  input: {
    realName: string;
    nickname: string;
    publicNameMode: string;
    isPublic: boolean;
    teamId: string;
  },
) {
  return apiPatch<AdminSwimmer>(`/api/admin/swimmers/${swimmerId}`, input);
}

export function listAdminEvents() {
  return apiGet<{ events: EventDefinition[] }>("/api/admin/events");
}

export function createAdminEvent(input: {
  poolLengthM: number;
  distanceM: number;
  stroke: string;
  effortType: string;
  displayName?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return apiPost<EventDefinition>("/api/admin/events", input);
}

export function quickRecordPerformance(input: {
  swimmerId: string;
  eventId: string;
  timeMs: number;
  sourceType: string;
  performedOn?: string;
}) {
  return apiPost("/api/admin/performances/quick", input);
}

export function createContext(input: {
  sourceType: string;
  title: string;
  performedOn?: string;
  location?: string;
}) {
  return apiPost<{ id: string }>("/api/admin/contexts", input);
}

export function addContextPerformances(
  contextId: string,
  performances: Array<{
    swimmerId: string;
    eventId: string;
    timeMs: number;
  }>,
) {
  return apiPost(`/api/admin/contexts/${contextId}/performances`, {
    performances,
  });
}

export function createGoal(input: {
  swimmerId: string;
  eventId: string;
  horizon: string;
  title: string;
  targetTimeMs: number;
  targetDate: string;
}) {
  return apiPost<AdminGoal>("/api/admin/goals", input);
}

export function listAdminGoals() {
  return apiGet<{ goals: AdminGoal[] }>("/api/admin/goals");
}

export function listAdminPerformances() {
  return apiGet<{ performances: AdminPerformance[] }>("/api/admin/performances");
}
