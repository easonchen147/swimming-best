export type TeamSummary = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  swimmerCount?: number;
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
  effortType?: string;
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
  gapMs: number;
  isAchieved: boolean;
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

export type OfficialBenchmark = OfficialGrade & {
  achieved: boolean;
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
  officialBenchmarks: OfficialBenchmark[];
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

export type ArenaLeaderboardEntry = {
  rank: number;
  swimmerId: string;
  displayName: string;
  teamId: string;
  team: TeamSummary;
  ageBucket: string;
  bestTimeMs: number;
  gapFromLeaderMs: number;
};

export type ArenaLeader = {
  swimmerId: string;
  displayName: string;
  teamId: string;
  team: TeamSummary;
  bestTimeMs: number;
};

export type ArenaGroup = {
  groupKey: string;
  gender: "male" | "female" | "all";
  ageBucket: string;
  event: EventDefinition;
  competitorCount: number;
  heatScore: number;
  heatLabel: string;
  leaderGapMs: number;
  leaderGapPercent: number;
  leader: ArenaLeader;
  rankings: ArenaLeaderboardEntry[];
};

export type ArenaPayload = {
  filters: {
    gender: "male" | "female" | "all";
    poolLengthM?: number;
    teamId: string;
    ageBucket: string;
  };
  summary: {
    groupCount: number;
    competitorCount: number;
  };
  groups: ArenaGroup[];
};

export type SwimmerSummaryHighlight = {
  eventId: string;
  eventDisplayName: string;
  bestTimeMs: number;
  officialGradeLabel: string | null;
  nextOfficialGradeLabel: string | null;
  nextOfficialGradeGapMs: number | null;
  progress30dMs: number;
  progress90dMs: number;
};

export type SwimmerSummaryExport = {
  swimmer: Pick<
    AdminSwimmer,
    "id" | "realName" | "nickname" | "gender" | "birthYear" | "teamId" | "team"
  > & {
    displayName: string;
    ageBucket: string;
  };
  summary: {
    strongestEventCount: number;
    achievedGoalCount: number;
    activeGoalCount: number;
    standoutProgress30dMs: number;
    standoutProgress90dMs: number;
  };
  highlights: SwimmerSummaryHighlight[];
  goals: GoalProgress[];
};

export type AdminSwimmer = {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  publicNameMode: string;
  isPublic: boolean;
  gender: Gender;
  birthDate?: string;
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
