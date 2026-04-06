import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  AdminGoal,
  AdminPerformance,
  AdminSwimmer,
  SwimmerSummaryExport,
  EventDefinition,
  Gender,
  StandardEntry,
  TeamSummary,
  TimeStandard,
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
  gender: Gender;
  teamId: string;
  birthYear?: number;
  notes?: string;
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
    gender: Gender;
    teamId: string;
    birthYear?: number;
    notes?: string;
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
  publicNote?: string;
  adminNote?: string;
  tags?: string[];
}) {
  return apiPost("/api/admin/performances/quick", input);
}

export function createContext(input: {
  sourceType: string;
  title: string;
  performedOn?: string;
  location?: string;
  publicNote?: string;
  adminNote?: string;
  tags?: string[];
}) {
  return apiPost<{ id: string }>("/api/admin/contexts", input);
}

export function addContextPerformances(
  contextId: string,
  performances: Array<{
    swimmerId: string;
    eventId: string;
    timeMs: number;
    publicNote?: string;
    adminNote?: string;
    tags?: string[];
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
  isPublic?: boolean;
  publicNote?: string;
  adminNote?: string;
}) {
  return apiPost<AdminGoal>("/api/admin/goals", input);
}

export function listAdminGoals() {
  return apiGet<{ goals: AdminGoal[] }>("/api/admin/goals");
}

export function listAdminPerformances() {
  return apiGet<{ performances: AdminPerformance[] }>("/api/admin/performances");
}

export function listAdminStandards() {
  return apiGet<{ standards: TimeStandard[] }>("/api/admin/standards");
}

export function createAdminStandard(input: {
  tierGroup: string;
  name: string;
  tierOrder: number;
  colorHex: string;
}) {
  return apiPost<TimeStandard>("/api/admin/standards", input);
}

export function updateAdminStandard(
  standardId: string,
  input: Partial<{
    tierGroup: string;
    name: string;
    tierOrder: number;
    colorHex: string;
  }>,
) {
  return apiPatch<TimeStandard>(`/api/admin/standards/${standardId}`, input);
}

export function deleteAdminStandard(standardId: string) {
  return apiDelete<void>(`/api/admin/standards/${standardId}`);
}

export function listAdminStandardEntries(standardId: string) {
  return apiGet<{ entries: StandardEntry[] }>(`/api/admin/standards/${standardId}/entries`);
}

export function createAdminStandardEntry(
  standardId: string,
  input: {
    eventId: string;
    gender: "male" | "female" | "all";
    qualifyingTimeMs: number;
  },
) {
  return apiPost<StandardEntry>(`/api/admin/standards/${standardId}/entries`, input);
}

export function updateAdminStandardEntry(
  entryId: string,
  input: Partial<{
    eventId: string;
    gender: "male" | "female" | "all";
    qualifyingTimeMs: number;
  }>,
) {
  return apiPatch<StandardEntry>(`/api/admin/standards/entries/${entryId}`, input);
}

export function deleteAdminStandardEntry(entryId: string) {
  return apiDelete<void>(`/api/admin/standards/entries/${entryId}`);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const rawText = response.status === 204 ? "" : await response.text();
  const hasBody = rawText.trim().length > 0;

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (hasBody) {
      try {
        const data = JSON.parse(rawText) as { error?: string; message?: string };
        errorMessage = data.error || data.message || errorMessage;
      } catch {
        errorMessage = rawText;
      }
    }
    throw new Error(errorMessage);
  }

  if (!hasBody) {
    return undefined as T;
  }

  return JSON.parse(rawText) as T;
}

export type ImportPreviewResponse = {
  validRows: Array<{
    line: number;
    swimmerId: string;
    swimmerSlug: string;
    eventId: string;
    eventDisplay: string;
    performedOn: string;
    timeSeconds: number;
    timeMs: number;
    sourceType: string;
    tags: string[];
  }>;
  errorRows: Array<{
    line: number;
    raw: Record<string, string>;
    errors: string[];
  }>;
  summary: {
    total: number;
    valid: number;
    errors: number;
  };
};

export type ImportConfirmResponse = {
  imported: number;
  contextsCreated: number;
  performancesCreated: number;
  tagsCreated: number;
};

export async function previewImportCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/import/preview", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return parseResponse<ImportPreviewResponse>(response);
}

export function confirmImportCsv(rows: ImportPreviewResponse["validRows"]) {
  return apiPost<ImportConfirmResponse>("/api/admin/import/confirm", { rows });
}

export function getImportTemplateUrl() {
  return "/api/admin/import/template";
}

export function getSwimmerExportUrl(swimmerId: string) {
  return `/api/admin/export/swimmers/${swimmerId}/performances.csv`;
}

export function getSwimmerSummaryExport(swimmerId: string) {
  return apiGet<SwimmerSummaryExport>(`/api/admin/export/swimmers/${swimmerId}/summary`);
}

export function getSwimmerSummaryExportUrl(swimmerId: string) {
  return `/admin/export/swimmers/${swimmerId}/summary`;
}

export function getTeamExportUrl(teamId: string) {
  return `/api/admin/export/teams/${teamId}/performances.csv`;
}
