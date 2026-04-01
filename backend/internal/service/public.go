package service

import (
	"context"
	"errors"

	"swimming-best/backend/internal/analytics"
	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
)

type PublicService struct {
	repo      *repository.SQLiteRepository
	analytics *analytics.Service
}

type PublicSwimmerSummary struct {
	ID              string `json:"id"`
	Slug            string `json:"slug"`
	DisplayName     string `json:"displayName"`
	StrongestEventID string `json:"strongestEventId"`
}

type PublicGoalProgress struct {
	ID                string             `json:"id"`
	Title             string             `json:"title"`
	Horizon           domain.GoalHorizon `json:"horizon"`
	TargetTimeMS      int64              `json:"targetTimeMs"`
	TargetDate        string             `json:"targetDate"`
	BaselineTimeMS    int64              `json:"baselineTimeMs"`
	CurrentBestTimeMS int64              `json:"currentBestTimeMs"`
	Progress          float64            `json:"progress"`
}

type PublicEventAnalyticsPayload struct {
	Swimmer PublicSwimmerSummary    `json:"swimmer"`
	Event   domain.Event            `json:"event"`
	Series  analytics.Series        `json:"series"`
	Goals   []PublicGoalProgress    `json:"goals"`
}

type CompareSwimmerPayload struct {
	SwimmerID         string          `json:"swimmerId"`
	DisplayName       string          `json:"displayName"`
	Series            analytics.Series `json:"series"`
	CurrentBestTimeMS int64           `json:"currentBestTimeMs"`
	ImprovementTimeMS int64           `json:"improvementTimeMs"`
	ImprovementRatio  float64         `json:"improvementRatio"`
}

type ComparePayload struct {
	Event    domain.Event           `json:"event"`
	Swimmers []CompareSwimmerPayload `json:"swimmers"`
}

func NewPublicService(repo *repository.SQLiteRepository, analyticsService *analytics.Service) *PublicService {
	if analyticsService == nil {
		analyticsService = analytics.NewService()
	}

	return &PublicService{repo: repo, analytics: analyticsService}
}

func (s *PublicService) ListPublicSwimmers(ctx context.Context) ([]PublicSwimmerSummary, error) {
	swimmers, err := s.repo.ListPublicSwimmers(ctx)
	if err != nil {
		return nil, err
	}

	summaries := make([]PublicSwimmerSummary, 0, len(swimmers))
	for _, swimmer := range swimmers {
		strongestEventID, err := s.repo.StrongestEventID(ctx, swimmer.ID)
		if err != nil {
			return nil, err
		}

		summaries = append(summaries, PublicSwimmerSummary{
			ID:               swimmer.ID,
			Slug:             swimmer.Slug,
			DisplayName:      displayName(swimmer),
			StrongestEventID: strongestEventID,
		})
	}

	return summaries, nil
}

func (s *PublicService) GetPublicEventAnalytics(ctx context.Context, swimmerSlug, eventID string) (PublicEventAnalyticsPayload, error) {
	swimmer, err := s.repo.GetPublicSwimmerBySlug(ctx, swimmerSlug)
	if err != nil {
		return PublicEventAnalyticsPayload{}, err
	}

	event, err := s.repo.GetEvent(ctx, eventID)
	if err != nil {
		return PublicEventAnalyticsPayload{}, err
	}

	performances, err := s.repo.ListPerformancesForSwimmerEvent(ctx, swimmer.ID, eventID)
	if err != nil {
		return PublicEventAnalyticsPayload{}, err
	}

	goals, err := s.repo.ListGoalsForSwimmerEvent(ctx, swimmer.ID, eventID)
	if err != nil {
		return PublicEventAnalyticsPayload{}, err
	}

	series := s.analytics.BuildSeries(performances)
	payload := PublicEventAnalyticsPayload{
		Swimmer: PublicSwimmerSummary{
			ID:          swimmer.ID,
			Slug:        swimmer.Slug,
			DisplayName: displayName(swimmer),
		},
		Event:  event,
		Series: series,
	}

	for _, goal := range goals {
		payload.Goals = append(payload.Goals, PublicGoalProgress{
			ID:                goal.ID,
			Title:             goal.Title,
			Horizon:           goal.Horizon,
			TargetTimeMS:      goal.TargetTimeMS,
			TargetDate:        goal.TargetDate,
			BaselineTimeMS:    goal.BaselineTimeMS,
			CurrentBestTimeMS: series.CurrentBestTimeMS,
			Progress:          goalProgress(goal.BaselineTimeMS, series.CurrentBestTimeMS, goal.TargetTimeMS),
		})
	}

	return payload, nil
}

func (s *PublicService) ComparePublicEvent(ctx context.Context, eventID string, swimmerIDs []string) (ComparePayload, error) {
	if eventID == "" {
		return ComparePayload{}, errors.New("event id is required")
	}
	if len(swimmerIDs) == 0 {
		return ComparePayload{}, errors.New("at least one swimmer is required")
	}

	event, err := s.repo.GetEvent(ctx, eventID)
	if err != nil {
		return ComparePayload{}, err
	}

	allPerformances, err := s.repo.ListPerformancesForEventAndSwimmers(ctx, eventID, swimmerIDs)
	if err != nil {
		return ComparePayload{}, err
	}

	grouped := map[string][]domain.Performance{}
	for _, performance := range allPerformances {
		grouped[performance.SwimmerID] = append(grouped[performance.SwimmerID], performance)
	}

	payload := ComparePayload{Event: event}
	for _, swimmerID := range swimmerIDs {
		swimmer, err := s.repo.GetSwimmer(ctx, swimmerID)
		if err != nil {
			return ComparePayload{}, err
		}

		series := s.analytics.BuildSeries(grouped[swimmerID])
		improvementTimeMS := int64(0)
		improvementRatio := 0.0
		if len(series.Raw) > 0 && series.CurrentBestTimeMS > 0 {
			firstTime := series.Raw[0].TimeMS
			improvementTimeMS = firstTime - series.CurrentBestTimeMS
			if firstTime > 0 {
				improvementRatio = float64(improvementTimeMS) / float64(firstTime)
			}
		}

		payload.Swimmers = append(payload.Swimmers, CompareSwimmerPayload{
			SwimmerID:         swimmer.ID,
			DisplayName:       displayName(swimmer),
			Series:            series,
			CurrentBestTimeMS: series.CurrentBestTimeMS,
			ImprovementTimeMS: improvementTimeMS,
			ImprovementRatio:  improvementRatio,
		})
	}

	return payload, nil
}

func displayName(swimmer domain.Swimmer) string {
	switch swimmer.PublicNameMode {
	case domain.PublicNameModeRealName:
		return swimmer.RealName
	case domain.PublicNameModeNickname:
		if swimmer.Nickname != "" {
			return swimmer.Nickname
		}
		return swimmer.RealName
	default:
		if swimmer.Nickname != "" {
			return swimmer.Nickname
		}
		return swimmer.RealName
	}
}

func goalProgress(baseline, currentBest, target int64) float64 {
	if baseline <= 0 || target <= 0 || baseline == target {
		return 0
	}

	progress := float64(baseline-currentBest) / float64(baseline-target)
	if progress < 0 {
		return 0
	}
	if progress > 1 {
		return 1
	}
	return progress
}
