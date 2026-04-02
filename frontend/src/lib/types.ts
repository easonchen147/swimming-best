export type TeamSummary = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type PublicSwimmerSummary = {
  id: string;
  slug: string;
  displayName: string;
  teamId: string;
  team: TeamSummary;
  strongestEventId: string;
};

export type PublicSwimmerDetail = {
  id: string;
  slug: string;
  displayName: string;
  teamId: string;
  team: TeamSummary;
};

export type EventDefinition = {
  id: string;
  poolLengthM: number;
  distanceM: number;
  stroke: string;
  effortType: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
};

export type PublicSwimmerEventSummary = {
  event: EventDefinition;
  currentBestTimeMs: number;
};

export type AnalyticsSeriesPoint = {
  performedOn: string;
  timeMs: number;
};

export type GoalProgress = {
  id: string;
  title: string;
  horizon: string;
  targetTimeMs: number;
  targetDate: string;
  baselineTimeMs: number;
  currentBestTimeMs: number;
  progress: number;
};

export type PublicEventAnalytics = {
  swimmer: PublicSwimmerSummary;
  event: EventDefinition;
  series: {
    raw: AnalyticsSeriesPoint[];
    pb: AnalyticsSeriesPoint[];
    trend: AnalyticsSeriesPoint[];
    currentBestTimeMs: number;
  };
  goals: GoalProgress[];
};

export type ComparePayload = {
  event: EventDefinition;
  swimmers: Array<{
    swimmerId: string;
    displayName: string;
    teamId: string;
    team: TeamSummary;
    series: PublicEventAnalytics["series"];
    currentBestTimeMs: number;
    improvementTimeMs: number;
    improvementRatio: number;
  }>;
};

export type AdminSwimmer = {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  publicNameMode: string;
  isPublic: boolean;
  teamId: string;
  team: TeamSummary;
};

export type AdminGoal = {
  id: string;
  swimmerId: string;
  eventId: string;
  title: string;
  baselineTimeMs: number;
  targetTimeMs: number;
  targetDate: string;
  horizon: string;
  swimmer?: Pick<AdminSwimmer, "id" | "nickname" | "realName" | "teamId" | "team">;
  event?: EventDefinition;
};

export type AdminPerformance = {
  id: string;
  swimmerId: string;
  eventId: string;
  timeMs: number;
  performedOn: string;
  resultStatus: string;
  tags: string[];
  swimmer: Pick<AdminSwimmer, "id" | "nickname" | "realName" | "teamId" | "team">;
  event: EventDefinition;
};
