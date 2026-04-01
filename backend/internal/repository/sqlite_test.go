package repository_test

import (
	"context"
	"errors"
	"path/filepath"
	"testing"

	"swimming-best/backend/internal/db"
	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
)

func TestSQLiteRepositoryCreatesAndListsSwimmers(t *testing.T) {
	t.Helper()

	repo := newRepository(t)
	ctx := context.Background()

	created, err := repo.CreateSwimmer(ctx, domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
		TeamName:       "Blue Lane",
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() error = %v", err)
	}

	if created.ID == "" {
		t.Fatal("CreateSwimmer() returned empty ID")
	}

	swimmers, err := repo.ListSwimmers(ctx)
	if err != nil {
		t.Fatalf("ListSwimmers() error = %v", err)
	}

	if len(swimmers) != 1 {
		t.Fatalf("len(swimmers) = %d, want 1", len(swimmers))
	}

	if swimmers[0].Nickname != "Dolphin A" {
		t.Fatalf("swimmers[0].Nickname = %q, want %q", swimmers[0].Nickname, "Dolphin A")
	}
}

func TestSQLiteRepositoryRejectsDuplicateStructuredEvents(t *testing.T) {
	t.Helper()

	repo := newRepository(t)
	ctx := context.Background()

	_, err := repo.CreateEvent(ctx, domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() first call error = %v", err)
	}

	_, err = repo.CreateEvent(ctx, domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if !errors.Is(err, repository.ErrConflict) {
		t.Fatalf("CreateEvent() duplicate error = %v, want ErrConflict", err)
	}
}

func newRepository(t *testing.T) *repository.SQLiteRepository {
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

	return repository.NewSQLiteRepository(sqlite)
}
