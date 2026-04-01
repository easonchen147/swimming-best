package http_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/analytics"
	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/config"
	"swimming-best/backend/internal/db"
	"swimming-best/backend/internal/domain"
	httpapi "swimming-best/backend/internal/http"
	"swimming-best/backend/internal/repository"
	"swimming-best/backend/internal/service"
)

func TestPublicAPIExposesVisibleSwimmersAnalyticsAndCompare(t *testing.T) {
	t.Helper()

	router, swimmerSlug, eventID, swimmerIDs := newPublicRouter(t)

	listRequest := httptest.NewRequest(http.MethodGet, "/api/public/swimmers", nil)
	listRecorder := httptest.NewRecorder()
	router.ServeHTTP(listRecorder, listRequest)

	if listRecorder.Code != http.StatusOK {
		t.Fatalf("listRecorder.Code = %d, want %d", listRecorder.Code, http.StatusOK)
	}

	analyticsRequest := httptest.NewRequest(http.MethodGet, "/api/public/swimmers/"+swimmerSlug+"/events/"+eventID+"/analytics", nil)
	analyticsRecorder := httptest.NewRecorder()
	router.ServeHTTP(analyticsRecorder, analyticsRequest)

	if analyticsRecorder.Code != http.StatusOK {
		t.Fatalf("analyticsRecorder.Code = %d, want %d", analyticsRecorder.Code, http.StatusOK)
	}

	compareRequest := httptest.NewRequest(http.MethodGet, "/api/public/compare?eventId="+eventID+"&swimmerId="+swimmerIDs[0]+"&swimmerId="+swimmerIDs[1], nil)
	compareRecorder := httptest.NewRecorder()
	router.ServeHTTP(compareRecorder, compareRequest)

	if compareRecorder.Code != http.StatusOK {
		t.Fatalf("compareRecorder.Code = %d, want %d", compareRecorder.Code, http.StatusOK)
	}

	hiddenRequest := httptest.NewRequest(http.MethodGet, "/api/public/swimmers/does-not-exist/events/"+eventID+"/analytics", nil)
	hiddenRecorder := httptest.NewRecorder()
	router.ServeHTTP(hiddenRecorder, hiddenRequest)

	if hiddenRecorder.Code != http.StatusNotFound {
		t.Fatalf("hiddenRecorder.Code = %d, want %d", hiddenRecorder.Code, http.StatusNotFound)
	}
}

func newPublicRouter(t *testing.T) (http.Handler, string, string, []string) {
	t.Helper()

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("secret-pass"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword() error = %v", err)
	}

	authService, err := auth.New(config.AuthConfig{
		SessionSecret: "super-secret-key",
		CookieName:    "swimming_best_admin",
		Admins: []config.AdminConfig{
			{
				Username:     "coach",
				PasswordHash: string(passwordHash),
			},
		},
	})
	if err != nil {
		t.Fatalf("auth.New() error = %v", err)
	}

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
	publicService := service.NewPublicService(repo, analytics.NewService())

	event, err := repo.CreateEvent(context.Background(), domain.CreateEventParams{
		PoolLengthM: 25,
		DistanceM:   25,
		Stroke:      domain.StrokeFreestyle,
		EffortType:  domain.EffortTypeSprint,
	})
	if err != nil {
		t.Fatalf("CreateEvent() error = %v", err)
	}

	swimmerA, err := repo.CreateSwimmer(context.Background(), domain.CreateSwimmerParams{
		RealName:       "Alice Wang",
		Nickname:       "Dolphin A",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() swimmerA error = %v", err)
	}

	swimmerB, err := repo.CreateSwimmer(context.Background(), domain.CreateSwimmerParams{
		RealName:       "Bella Chen",
		Nickname:       "Dolphin B",
		PublicNameMode: domain.PublicNameModeNickname,
		IsPublic:       true,
	})
	if err != nil {
		t.Fatalf("CreateSwimmer() swimmerB error = %v", err)
	}

	for _, input := range []struct {
		swimmerID string
		timeMS    int64
	}{
		{swimmerA.ID, 15000},
		{swimmerA.ID, 14200},
		{swimmerB.ID, 16000},
		{swimmerB.ID, 15400},
	} {
		if _, err := adminService.QuickRecordPerformance(context.Background(), service.QuickRecordPerformanceInput{
			SwimmerID:  input.swimmerID,
			EventID:    event.ID,
			TimeMS:     input.timeMS,
			SourceType: domain.SourceTypeTest,
		}); err != nil {
			t.Fatalf("QuickRecordPerformance() error = %v", err)
		}
	}

	if _, err := adminService.CreateGoal(context.Background(), service.CreateGoalInput{
		SwimmerID:    swimmerA.ID,
		EventID:      event.ID,
		Horizon:      domain.GoalHorizonShort,
		Title:        "Break 14.00",
		TargetTimeMS: 14000,
		TargetDate:   "2026-06-30",
	}); err != nil {
		t.Fatalf("CreateGoal() error = %v", err)
	}

	return httpapi.NewRouter(
		authService,
		httpapi.WithAdminService(adminService),
		httpapi.WithPublicService(publicService),
	), swimmerA.Slug, event.ID, []string{swimmerA.ID, swimmerB.ID}
}

var _ = json.Valid
