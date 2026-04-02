import { apiGet } from "@/lib/api/client";
import type {
  ComparePayload,
  PublicEventAnalytics,
  PublicSwimmerDetail,
  PublicSwimmerEventSummary,
  PublicSwimmerSummary,
} from "@/lib/types";

export function listPublicSwimmers() {
  return apiGet<{ swimmers: PublicSwimmerSummary[] }>("/api/public/swimmers");
}

export function listPublicSwimmersByTeam(teamId?: string) {
  const params = new URLSearchParams();
  if (teamId) {
    params.set("teamId", teamId);
  }

  return apiGet<{ swimmers: PublicSwimmerSummary[] }>(
    `/api/public/swimmers${params.size > 0 ? `?${params.toString()}` : ""}`,
  );
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
