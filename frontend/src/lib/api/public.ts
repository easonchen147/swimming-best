import { apiGet } from "@/lib/api/client";
import type {
  ArenaPayload,
  ComparePayload,
  PublicEventAnalytics,
  PublicSwimmerDetail,
  PublicSwimmerEventSummary,
  PublicSwimmerSummary,
} from "@/lib/types";

export function listPublicSwimmers(input?: {
  teamId?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (input?.teamId) {
    params.set("teamId", input.teamId);
  }
  if (input?.search?.trim()) {
    params.set("search", input.search.trim());
  }

  return apiGet<{ swimmers: PublicSwimmerSummary[] }>(
    `/api/public/swimmers${params.size > 0 ? `?${params.toString()}` : ""}`,
  );
}

export function listPublicSwimmersByTeam(teamId?: string) {
  return listPublicSwimmers(teamId ? { teamId } : undefined);
}

export function getPublicSwimmer(slug: string) {
  return apiGet<PublicSwimmerDetail>(`/api/public/swimmers/${slug}`);
}

export function listPublicSwimmerEvents(slug: string) {
  return apiGet<{ events: PublicSwimmerEventSummary[] }>(
    `/api/public/swimmers/${slug}/events`,
  );
}

export function getPublicEventAnalytics(slug: string, eventId: string) {
  return apiGet<PublicEventAnalytics>(
    `/api/public/swimmers/${slug}/events/${eventId}/analytics`,
  );
}

export function comparePublicEvent(eventId: string, swimmerIds: string[]) {
  const params = new URLSearchParams({ eventId });
  for (const swimmerId of swimmerIds) {
    params.append("swimmerId", swimmerId);
  }

  return apiGet<ComparePayload>(`/api/public/compare?${params.toString()}`);
}

export function getPublicArena(input?: {
  gender?: "male" | "female";
  poolLengthM?: number;
  teamId?: string;
  ageBucket?: string;
}) {
  const params = new URLSearchParams();
  if (input?.gender) {
    params.set("gender", input.gender);
  }
  if (typeof input?.poolLengthM === "number") {
    params.set("poolLengthM", String(input.poolLengthM));
  }
  if (input?.teamId) {
    params.set("teamId", input.teamId);
  }
  if (input?.ageBucket) {
    params.set("ageBucket", input.ageBucket);
  }

  return apiGet<ArenaPayload>(
    `/api/public/arena${params.size > 0 ? `?${params.toString()}` : ""}`,
  );
}
