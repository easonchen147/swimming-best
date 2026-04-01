package service_test

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"swimming-best/backend/internal/analytics"
	"swimming-best/backend/internal/db"
	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
	"swimming-best/backend/internal/service"
)

func TestPublicServiceListsVisibleSwimmersWithSafeDisplayName(t *testing.T) {
	t.Helper()

	publicService, repo, event := newPublicService(t)
	ctx := context.Background()

	if _, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	}); err != nil {
		t.Fatalf("CreateSwimmer() public error = %v", err)
	}

	if _, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Bob Li",
		Nickname:       "Hidden B",
		PublicNameMode: domain.PublicNameModeHidden,
		IsPublic:       false,
	}); err != nil {
		t.Fatalf("CreateSwimmer() hidden error = %v", err)
	}

	swimmers, err := publicService.ListPublicSwimmers(ctx)
	if err != nil {
		t.Fatalf("ListPublicSwimmers() error = %v", err)
	}

	if len(swimmers) != 1 {
		t.Fatalf("len(swimmers) = %d, want 1", len(swimmers))
	}

	if swimmers[0].DisplayName != "Dolphin A" {
		t.Fatalf("swimmers[0].DisplayName = %q, want %q", swimmers[0].DisplayName, "Dolphin A")
	}

	if swimmers[0].StrongestEventID != event.ID && swimmers[0].StrongestEventID != "" {
		t.Fatalf("swimmers[0].StrongestEventID = %q, want empty or %q", swimmers[0].StrongestEventID, event.ID)
	}
}

func TestPublicServiceBuildsEventAnalyticsAndCompare(t *testing.T) {
	t.Helper()

	publicService, repo, event := newPublicService(t)
	ctx := context.Background()

	swimmerA, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() swimmerA error = %v", err)
	}

	swimmerB, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Bella Chen",
		Nickname:       "Dolphin B",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() swimmerB error = %v", err)
	}

	adminService := service.NewAdminService(repo, func() time.Time {
		return time.Date(2026, time.April, 1, 10, 0, 0, 0, time.UTC)
	})

	for _, timeMS := range []int64{15000, 14900, 14200} {
		if _, err := adminService.QuickRecordPerformance(ctx, service.QuickRecordPerformanceInput{
			SwimmerID:  swimmerA.ID,
			EventID:    event.ID,
			TimeMS:     timeMS,
			SourceType: domain.SourceTypeTest,
		}); err != nil {
			t.Fatalf("QuickRecordPerformance() swimmerA error = %v", err)
		}
	}

	for _, timeMS := range []int64{16000, 15400} {
		if _, err := adminService.QuickRecordPerformance(ctx, service.QuickRecordPerformanceInput{
			SwimmerID:  swimmerB.ID,
			EventID:    event.ID,
			TimeMS:     timeMS,
			SourceType: domain.SourceTypeTest,
		}); err != nil {
			t.Fatalf("QuickRecordPerformance() swimmerB error = %v", err)
		}
	}

	if _, err := adminService.CreateGoal(ctx, service.CreateGoalInput{
		SwimmerID:    swimmerA.ID,
		EventID:      event.ID,
		Horizon:      domain.GoalHorizonShort,
		Title:        "Break 14.00",
		TargetTimeMS: 14000,
		TargetDate:   "2026-06-30",
	}); err != nil {
		t.Fatalf("CreateGoal() error = %v", err)
	}

	analyticsPayload, err := publicService.GetPublicEventAnalytics(ctx, swimmerA.Slug, event.ID)
	if err != nil {
		t.Fatalf("GetPublicEventAnalytics() error = %v", err)
	}

	if analyticsPayload.Series.CurrentBestTimeMS != 14200 {
		t.Fatalf("analyticsPayload.Series.CurrentBestTimeMS = %d, want %d", analyticsPayload.Series.CurrentBestTimeMS, 14200)
	}

	if len(analyticsPayload.Goals) != 1 {
		t.Fatalf("len(analyticsPayload.Goals) = %d, want 1", len(analyticsPayload.Goals))
	}

	comparePayload, err := publicService.ComparePublicEvent(ctx, event.ID, []string{swimmerA.ID, swimmerB.ID})
	if err != nil {
		t.Fatalf("ComparePublicEvent() error = %v", err)
	}

	if len(comparePayload.Swimmers) != 2 {
		t.Fatalf("len(comparePayload.Swimmers) = %d, want 2", len(comparePayload.Swimmers))
	}
}

func newPublicService(t *testing.T) (*service.PublicService, *repository.SQLiteRepository, domain.Event) {
	t.Helper()

	databasePath := filepath.Join(t.TempDir(), "test.db")
	sqlite, err := db.Open(databasePath)
	if err != nil {
		t.Fatalf("db.Open() error = %v", err)
	}
	t.Cleanup(func() {
		_ = sqlite.Close()
	})

	if err := db.Migrate(sqlite); err != nil {
		t.Fatalf("db.Migrate() error = %v", err)
	}

	repo := repository.NewSQLiteRepository(sqlite)
	event, err := repo.CreateEvent(context.Background(), domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() error = %v", err)
	}

	publicService := service.NewPublicService(repo, analytics.NewService())
	return publicService, repo, event
}

