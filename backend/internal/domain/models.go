package domain

import "time"

type PublicNameMode string

const (
	PublicNameModeRealName PublicNameMode = "real_name"
	PublicNameModeNickname PublicNameMode = "nickname"
	PublicNameModeHidden   PublicNameMode = "hidden"
)

type Stroke string

const (
	StrokeFreestyle Stroke = "freestyle"
	StrokeBreast    Stroke = "breaststroke"
	StrokeBack      Stroke = "backstroke"
	StrokeFly       Stroke = "butterfly"
	StrokeMedley    Stroke = "medley"
)

type EffortType string

const (
	EffortTypeSprint    EffortType = "sprint"
	EffortTypePace      EffortType = "pace"
	EffortTypeTechnique EffortType = "technique"
	EffortTypeEndurance EffortType = "endurance"
	EffortTypeRace      EffortType = "race"
)

type SourceType string

const (
	SourceTypeSingle      SourceType = "single"
	SourceTypeTraining    SourceType = "training"
	SourceTypeTest        SourceType = "test"
	SourceTypeCompetition SourceType = "competition"
)

type ResultStatus string

const (
	ResultStatusValid   ResultStatus = "valid"
	ResultStatusInvalid ResultStatus = "invalid"
	ResultStatusDNF     ResultStatus = "dnf"
	ResultStatusDNS     ResultStatus = "dns"
)

type GoalHorizon string

const (
	GoalHorizonShort GoalHorizon = "short"
	GoalHorizonMid   GoalHorizon = "mid"
	GoalHorizonLong  GoalHorizon = "long"
)

type GoalStatus string

const (
	GoalStatusActive   GoalStatus = "active"
	GoalStatusAchieved GoalStatus = "achieved"
	GoalStatusMissed   GoalStatus = "missed"
	GoalStatusArchived GoalStatus = "archived"
)

type Swimmer struct {
	ID             string         `json:"id"`
	Slug           string         `json:"slug"`
	RealName       string         `json:"realName"`
	Nickname       string         `json:"nickname"`
	PublicNameMode PublicNameMode `json:"publicNameMode"`
	IsPublic       bool           `json:"isPublic"`
	AvatarURL      string         `json:"avatarUrl"`
	BirthYear      int            `json:"birthYear"`
	TeamName       string         `json:"teamName"`
	Notes          string         `json:"notes"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
}

type Event struct {
	ID          string     `json:"id"`
	PoolLengthM int        `json:"poolLengthM"`
	DistanceM   int        `json:"distanceM"`
	Stroke      Stroke     `json:"stroke"`
	EffortType  EffortType `json:"effortType"`
	DisplayName string     `json:"displayName"`
	SortOrder   int        `json:"sortOrder"`
	IsActive    bool       `json:"isActive"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type RecordContext struct {
	ID          string     `json:"id"`
	SourceType  SourceType `json:"sourceType"`
	Title       string     `json:"title"`
	PerformedOn string     `json:"performedOn"`
	Location    string     `json:"location"`
	PublicNote  string     `json:"publicNote"`
	AdminNote   string     `json:"adminNote"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Performance struct {
	ID           string       `json:"id"`
	ContextID    string       `json:"contextId"`
	SwimmerID    string       `json:"swimmerId"`
	EventID      string       `json:"eventId"`
	TimeMS       int64        `json:"timeMs"`
	PerformedOn  string       `json:"performedOn"`
	ResultStatus ResultStatus `json:"resultStatus"`
	PublicNote   string       `json:"publicNote"`
	AdminNote    string       `json:"adminNote"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type Goal struct {
	ID             string      `json:"id"`
	SwimmerID      string      `json:"swimmerId"`
	EventID        string      `json:"eventId"`
	ParentGoalID   string      `json:"parentGoalId"`
	Horizon        GoalHorizon `json:"horizon"`
	Title          string      `json:"title"`
	TargetTimeMS   int64       `json:"targetTimeMs"`
	TargetDate     string      `json:"targetDate"`
	BaselineTimeMS int64       `json:"baselineTimeMs"`
	Status         GoalStatus  `json:"status"`
	IsPublic       bool        `json:"isPublic"`
	PublicNote     string      `json:"publicNote"`
	AdminNote      string      `json:"adminNote"`
	AchievedAt     string      `json:"achievedAt"`
	CreatedAt      time.Time   `json:"createdAt"`
	UpdatedAt      time.Time   `json:"updatedAt"`
}

type CreateSwimmerParams struct {
	RealName       string
	Nickname       string
	PublicNameMode PublicNameMode
	IsPublic       bool
	AvatarURL      string
	BirthYear      int
	TeamName       string
	Notes          string
}

type CreateEventParams struct {
	PoolLengthM int
	DistanceM   int
	Stroke      Stroke
	EffortType  EffortType
	DisplayName string
	SortOrder   int
	IsActive    bool
}

type CreateRecordContextParams struct {
	SourceType  SourceType
	Title       string
	PerformedOn string
	Location    string
	PublicNote  string
	AdminNote   string
}

type CreatePerformanceParams struct {
	ContextID    string
	SwimmerID    string
	EventID      string
	TimeMS       int64
	PerformedOn  string
	ResultStatus ResultStatus
	PublicNote   string
	AdminNote    string
}

type CreateGoalParams struct {
	SwimmerID      string
	EventID        string
	ParentGoalID   string
	Horizon        GoalHorizon
	Title          string
	TargetTimeMS   int64
	TargetDate     string
	BaselineTimeMS int64
	Status         GoalStatus
	IsPublic       bool
	PublicNote     string
	AdminNote      string
}
