package service

import (
	"context"
	"errors"
	"time"

	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
)

type AdminService struct {
	repo *repository.SQLiteRepository
	now  func() time.Time
}

type QuickRecordPerformanceInput struct {
	SwimmerID   string
	EventID     string
	TimeMS      int64
	SourceType  domain.SourceType
	PerformedOn string
	PublicNote  string
	AdminNote   string
}

type QuickRecordPerformanceResult struct {
	Context     domain.RecordContext `json:"context"`
	Performance domain.Performance   `json:"performance"`
}

type CreateGoalInput struct {
	SwimmerID    string
	EventID      string
	ParentGoalID string
	Horizon      domain.GoalHorizon
	Title        string
	TargetTimeMS int64
	TargetDate   string
	IsPublic     bool
	PublicNote   string
	AdminNote    string
}

type CreateContextInput struct {
	SourceType  domain.SourceType
	Title       string
	PerformedOn string
	Location    string
	PublicNote  string
	AdminNote   string
}

type ContextPerformanceInput struct {
	SwimmerID    string
	EventID      string
	TimeMS       int64
	ResultStatus domain.ResultStatus
	PublicNote   string
	AdminNote    string
}

type CreateContextWithPerformancesInput struct {
	SourceType   domain.SourceType
	Title        string
	PerformedOn  string
	Location     string
	PublicNote   string
	AdminNote    string
	Performances []ContextPerformanceInput
}

type CreateContextWithPerformancesResult struct {
	Context      domain.RecordContext `json:"context"`
	Performances []domain.Performance `json:"performances"`
}

func NewAdminService(repo *repository.SQLiteRepository, now func() time.Time) *AdminService {
	if now == nil {
		now = time.Now
	}

	return &AdminService{repo: repo, now: now}
}

func (s *AdminService) CreateSwimmer(ctx context.Context, params domain.CreateSwimmerParams) (domain.Swimmer, error) {
	return s.repo.CreateSwimmer(ctx, params)
}

func (s *AdminService) CreateEvent(ctx context.Context, params domain.CreateEventParams) (domain.Event, error) {
	return s.repo.CreateEvent(ctx, params)
}

func (s *AdminService) CreateContext(ctx context.Context, input CreateContextInput) (domain.RecordContext, error) {
	return s.repo.CreateContext(ctx, domain.CreateRecordContextParams{
		SourceType:  input.SourceType,
		Title:       input.Title,
		PerformedOn: defaultDate(input.PerformedOn, s.now()),
		Location:    input.Location,
		PublicNote:  input.PublicNote,
		AdminNote:   input.AdminNote,
	})
}

func (s *AdminService) AddContextPerformances(ctx context.Context, contextID string, inputs []ContextPerformanceInput) ([]domain.Performance, error) {
	recordContext, err := s.repo.GetContext(ctx, contextID)
	if err != nil {
		return nil, err
	}

	params := make([]domain.CreatePerformanceParams, 0, len(inputs))
	for _, input := range inputs {
		params = append(params, domain.CreatePerformanceParams{
			ContextID:    contextID,
			SwimmerID:    input.SwimmerID,
			EventID:      input.EventID,
			TimeMS:       input.TimeMS,
			PerformedOn:  recordContext.PerformedOn,
			ResultStatus: defaultResultStatus(input.ResultStatus),
			PublicNote:   input.PublicNote,
			AdminNote:    input.AdminNote,
		})
	}

	return s.repo.CreatePerformances(ctx, params)
}

func (s *AdminService) CreateContextWithPerformances(ctx context.Context, input CreateContextWithPerformancesInput) (CreateContextWithPerformancesResult, error) {
	var result CreateContextWithPerformancesResult

	err := s.repo.WithTx(ctx, func(txRepo *repository.SQLiteRepository) error {
		txService := NewAdminService(txRepo, s.now)
		recordContext, err := txService.CreateContext(ctx, CreateContextInput{
			SourceType:  input.SourceType,
			Title:       input.Title,
			PerformedOn: input.PerformedOn,
			Location:    input.Location,
			PublicNote:  input.PublicNote,
			AdminNote:   input.AdminNote,
		})
		if err != nil {
			return err
		}

		performances, err := txService.AddContextPerformances(ctx, recordContext.ID, input.Performances)
		if err != nil {
			return err
		}

		result.Context = recordContext
		result.Performances = performances
		return nil
	})
	if err != nil {
		return result, err
	}

	return result, nil
}

func (s *AdminService) QuickRecordPerformance(ctx context.Context, input QuickRecordPerformanceInput) (QuickRecordPerformanceResult, error) {
	var result QuickRecordPerformanceResult
	performedOn := defaultDate(input.PerformedOn, s.now())
	sourceType := input.SourceType
	if sourceType == "" {
		sourceType = domain.SourceTypeSingle
	}

	err := s.repo.WithTx(ctx, func(txRepo *repository.SQLiteRepository) error {
		recordContext, err := txRepo.CreateContext(ctx, domain.CreateRecordContextParams{
			SourceType:  sourceType,
			Title:       "Quick Entry",
			PerformedOn: performedOn,
		})
		if err != nil {
			return err
		}

		performance, err := txRepo.CreatePerformance(ctx, domain.CreatePerformanceParams{
			ContextID:    recordContext.ID,
			SwimmerID:    input.SwimmerID,
			EventID:      input.EventID,
			TimeMS:       input.TimeMS,
			PerformedOn:  performedOn,
			ResultStatus: domain.ResultStatusValid,
			PublicNote:   input.PublicNote,
			AdminNote:    input.AdminNote,
		})
		if err != nil {
			return err
		}

		result.Context = recordContext
		result.Performance = performance
		return nil
	})
	if err != nil {
		return result, err
	}

	return result, nil
}

func (s *AdminService) CreateGoal(ctx context.Context, input CreateGoalInput) (domain.Goal, error) {
	if input.SwimmerID == "" || input.EventID == "" {
		return domain.Goal{}, errors.New("swimmer and event are required")
	}

	baseline, ok, err := s.repo.BestTimeMS(ctx, input.SwimmerID, input.EventID)
	if err != nil {
		return domain.Goal{}, err
	}
	if !ok {
		baseline = 0
	}

	return s.repo.CreateGoal(ctx, domain.CreateGoalParams{
		SwimmerID:      input.SwimmerID,
		EventID:        input.EventID,
		ParentGoalID:   input.ParentGoalID,
		Horizon:        input.Horizon,
		Title:          input.Title,
		TargetTimeMS:   input.TargetTimeMS,
		TargetDate:     input.TargetDate,
		BaselineTimeMS: baseline,
		Status:         domain.GoalStatusActive,
		IsPublic:       input.IsPublic,
		PublicNote:     input.PublicNote,
		AdminNote:      input.AdminNote,
	})
}

func defaultDate(value string, now time.Time) string {
	if value != "" {
		return value
	}
	return now.Format("2006-01-02")
}

func defaultResultStatus(status domain.ResultStatus) domain.ResultStatus {
	if status == "" {
		return domain.ResultStatusValid
	}
	return status
}
