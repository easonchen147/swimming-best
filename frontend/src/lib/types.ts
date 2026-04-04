export type TeamSummary = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type Gender = "male" | "female" | "unknown";

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
  gender: Gender;
  birthYear?: number;
  notes?: string;
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
  sourceType?: string;
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

export type OfficialGrade = {
  code: string;
  label: string;
  order: number;
  qualifyingTimeMs: number;
  qualifyingTime: string;
};

export type NextOfficialGrade = OfficialGrade & {
  gapMs: number;
};

export type TimeStandard = {
  id: string;
  tierGroup: string;
  name: string;
  tierOrder: number;
  colorHex: string;
  createdAt?: string;
};

export type StandardEntry = {
  id: string;
  standardId: string;
  eventId: string;
  gender: "male" | "female" | "all";
  qualifyingTimeMs: number;
  tierGroup: string;
  name: string;
  tierOrder: number;
  colorHex: string;
  eventDisplayName: string;
};

export type CustomBenchmark = StandardEntry & {
  achieved: boolean;
};

export type NextCustomBenchmark = StandardEntry & {
  gapMs: number;
};

export type BenchmarkLine = {
  name: string;
  tierGroup: string;
  colorHex: string;
  qualifyingTimeMs: number;
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
  officialGrade: OfficialGrade | null;
  nextOfficialGrade: NextOfficialGrade | null;
  officialGradeStatus: "ok" | "missing_gender" | "unavailable_for_event" | "no_valid_performance";
  customStandards: CustomBenchmark[];
  nextCustomStandard: NextCustomBenchmark | null;
  benchmarkLines: BenchmarkLine[];
};

export type CompareSwimmer = {
  swimmerId: string;
  displayName: string;
  teamId: string;
  team: TeamSummary;
  series: PublicEventAnalytics["series"];
  currentBestTimeMs: number;
  improvementTimeMs: number;
  improvementRatio: number;
};

export type ComparePayload = {
  event: EventDefinition;
  swimmers: CompareSwimmer[];
};

export type AdminSwimmer = {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  publicNameMode: string;
  isPublic: boolean;
  gender: Gender;
  birthYear?: number;
  avatarUrl?: string;
  notes?: string;
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
  isPublic?: boolean;
  publicNote?: string;
  adminNote?: string;
  achievedAt?: string;
  parentGoalId?: string;
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
  publicNote?: string;
  adminNote?: string;
  tags: string[];
  swimmer: Pick<AdminSwimmer, "id" | "nickname" | "realName" | "teamId" | "team">;
  event: EventDefinition;
};
