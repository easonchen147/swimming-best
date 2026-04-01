package service_test

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"swimming-best/backend/internal/db"
	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
	"swimming-best/backend/internal/service"
)

func TestAdminServiceQuickEntryCreatesSingleContextAndPerformance(t *testing.T) {
	t.Helper()

	adminService, repo := newAdminService(t)
	ctx := context.Background()

	swimmer, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() error = %v", err)
	}

	event, err := repo.CreateEvent(ctx, domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() error = %v", err)
	}

	result, err := adminService.QuickRecordPerformance(ctx, service.QuickRecordPerformanceInput{
		SwimmerID:  swimmer.ID,
		EventID:    event.ID,
		TimeMS:     15000,
		SourceType: domain.SourceTypeTest,
	})
	if err != nil {
		t.Fatalf("QuickRecordPerformance() error = %v", err)
	}

	if result.Context.SourceType != domain.SourceTypeTest {
		t.Fatalf("result.Context.SourceType = %q, want %q", result.Context.SourceType, domain.SourceTypeTest)
	}

	if result.Performance.TimeMS != 15000 {
		t.Fatalf("result.Performance.TimeMS = %d, want %d", result.Performance.TimeMS, 15000)
	}
}

func TestAdminServiceCreateGoalUsesCurrentBestAsBaseline(t *testing.T) {
	t.Helper()

	adminService, repo := newAdminService(t)
	ctx := context.Background()

	swimmer, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() error = %v", err)
	}

	event, err := repo.CreateEvent(ctx, domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() error = %v", err)
	}

	if _, err := adminService.QuickRecordPerformance(ctx, service.QuickRecordPerformanceInput{
		SwimmerID:  swimmer.ID,
		EventID:    event.ID,
		TimeMS:     15000,
		SourceType: domain.SourceTypeTest,
	}); err != nil {
		t.Fatalf("QuickRecordPerformance() error = %v", err)
	}

	goal, err := adminService.CreateGoal(ctx, service.CreateGoalInput{
		SwimmerID:    swimmer.ID,
		EventID:      event.ID,
		Horizon:      domain.GoalHorizonShort,
		Title:        "Break 14.50",
		TargetTimeMS: 14500,
		TargetDate:   "2026-06-30",
	})
	if err != nil {
		t.Fatalf("CreateGoal() error = %v", err)
	}

	if goal.BaselineTimeMS != 15000 {
		t.Fatalf("goal.BaselineTimeMS = %d, want %d", goal.BaselineTimeMS, 15000)
	}
}

func TestAdminServiceCreatesContextWithPerformances(t *testing.T) {
	t.Helper()

	adminService, repo := newAdminService(t)
	ctx := context.Background()

	swimmer, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() error = %v", err)
	}

	event, err := repo.CreateEvent(ctx, domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() error = %v", err)
	}

	result, err := adminService.CreateContextWithPerformances(ctx, service.CreateContextWithPerformancesInput{
		SourceType:  domain.SourceTypeCompetition,
		Title:       "April Meet",
		PerformedOn: "2026-04-01",
		Performances: []service.ContextPerformanceInput{
			{
				SwimmerID: swimmer.ID,
				EventID:   event.ID,
				TimeMS:    14900,
			},
		},
	})
	if err != nil {
		t.Fatalf("CreateContextWithPerformances() error = %v", err)
	}

	if result.Context.Title != "April Meet" {
		t.Fatalf("result.Context.Title = %q, want %q", result.Context.Title, "April Meet")
	}

	if len(result.Performances) != 1 {
		t.Fatalf("len(result.Performances) = %d, want 1", len(result.Performances))
	}
}

func newAdminService(t *testing.T) (*service.AdminService, *repository.SQLiteRepository) {
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
	adminService := service.NewAdminService(repo, func() time.Time {
		return time.Date(2026, time.April, 1, 10, 0, 0, 0, time.UTC)
	})

	return adminService, repo
}
