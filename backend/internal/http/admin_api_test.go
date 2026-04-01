package http_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/config"
	"swimming-best/backend/internal/db"
	"swimming-best/backend/internal/domain"
	httpapi "swimming-best/backend/internal/http"
	"swimming-best/backend/internal/repository"
	"swimming-best/backend/internal/service"
)

func TestAdminAPIQuickEntryAndGoalWorkflow(t *testing.T) {
	t.Helper()

	router := newAdminRouter(t)
	sessionCookie := loginAsAdmin(t, router)

	swimmerID := createSwimmerViaAPI(t, router, sessionCookie)
	eventID := createEventViaAPI(t, router, sessionCookie)

	quickEntryBody, err := json.Marshal(map[string]any{
		"swimmerId":  swimmerID,
		"eventId":    eventID,
		"timeMs":     15000,
		"sourceType": "test",
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	quickEntryRequest := httptest.NewRequest(http.MethodPost, "/api/admin/performances/quick", bytes.NewReader(quickEntryBody))
	quickEntryRequest.Header.Set("Content-Type", "application/json")
	quickEntryRequest.AddCookie(sessionCookie)
	quickEntryRecorder := httptest.NewRecorder()

	router.ServeHTTP(quickEntryRecorder, quickEntryRequest)

	if quickEntryRecorder.Code != http.StatusCreated {
		t.Fatalf("quickEntryRecorder.Code = %d, want %d", quickEntryRecorder.Code, http.StatusCreated)
	}

	goalBody, err := json.Marshal(map[string]any{
		"swimmerId":    swimmerID,
		"eventId":      eventID,
		"horizon":      "short",
		"title":        "Break 14.50",
		"targetTimeMs": 14500,
		"targetDate":   "2026-06-30",
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	goalRequest := httptest.NewRequest(http.MethodPost, "/api/admin/goals", bytes.NewReader(goalBody))
	goalRequest.Header.Set("Content-Type", "application/json")
	goalRequest.AddCookie(sessionCookie)
	goalRecorder := httptest.NewRecorder()

	router.ServeHTTP(goalRecorder, goalRequest)

	if goalRecorder.Code != http.StatusCreated {
		t.Fatalf("goalRecorder.Code = %d, want %d", goalRecorder.Code, http.StatusCreated)
	}

	contextBody, err := json.Marshal(map[string]any{
		"sourceType":  "competition",
		"title":       "April Meet",
		"performedOn": "2026-04-01",
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	contextRequest := httptest.NewRequest(http.MethodPost, "/api/admin/contexts", bytes.NewReader(contextBody))
	contextRequest.Header.Set("Content-Type", "application/json")
	contextRequest.AddCookie(sessionCookie)
	contextRecorder := httptest.NewRecorder()

	router.ServeHTTP(contextRecorder, contextRequest)

	if contextRecorder.Code != http.StatusCreated {
		t.Fatalf("contextRecorder.Code = %d, want %d", contextRecorder.Code, http.StatusCreated)
	}

	var contextResponse struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(contextRecorder.Body.Bytes(), &contextResponse); err != nil {
		t.Fatalf("Unmarshal() error = %v", err)
	}

	performanceBody, err := json.Marshal(map[string]any{
		"performances": []map[string]any{
			{
				"swimmerId": swimmerID,
				"eventId":   eventID,
				"timeMs":    14900,
			},
		},
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	performanceRequest := httptest.NewRequest(http.MethodPost, "/api/admin/contexts/"+contextResponse.ID+"/performances", bytes.NewReader(performanceBody))
	performanceRequest.Header.Set("Content-Type", "application/json")
	performanceRequest.AddCookie(sessionCookie)
	performanceRecorder := httptest.NewRecorder()

	router.ServeHTTP(performanceRecorder, performanceRequest)

	if performanceRecorder.Code != http.StatusCreated {
		t.Fatalf("performanceRecorder.Code = %d, want %d", performanceRecorder.Code, http.StatusCreated)
	}
}

func newAdminRouter(t *testing.T) http.Handler {
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

	return httpapi.NewRouter(authService, httpapi.WithAdminService(adminService))
}

func loginAsAdmin(t *testing.T, router http.Handler) *http.Cookie {
	t.Helper()

	body, err := json.Marshal(map[string]string{
		"username": "coach",
		"password": "secret-pass",
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	request := httptest.NewRequest(http.MethodPost, "/api/admin/login", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("recorder.Code = %d, want %d", recorder.Code, http.StatusOK)
	}

	response := recorder.Result()
	if len(response.Cookies()) != 1 {
		t.Fatalf("len(response.Cookies()) = %d, want 1", len(response.Cookies()))
	}

	return response.Cookies()[0]
}

func createSwimmerViaAPI(t *testing.T, router http.Handler, sessionCookie *http.Cookie) string {
	t.Helper()

	body, err := json.Marshal(map[string]any{
		"realName":       "Alice Wang",
		"nickname":       "Dolphin A",
		"publicNameMode": string(domain.PublicNameModeNickname),
		"isPublic":       true,
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	request := httptest.NewRequest(http.MethodPost, "/api/admin/swimmers", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("recorder.Code = %d, want %d", recorder.Code, http.StatusCreated)
	}

	var response struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("Unmarshal() error = %v", err)
	}

	return response.ID
}

func createEventViaAPI(t *testing.T, router http.Handler, sessionCookie *http.Cookie) string {
	t.Helper()

	body, err := json.Marshal(map[string]any{
		"poolLengthM": 25,
		"distanceM":   25,
		"stroke":      string(domain.StrokeFreestyle),
		"effortType":  string(domain.EffortTypeSprint),
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	request := httptest.NewRequest(http.MethodPost, "/api/admin/events", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("recorder.Code = %d, want %d", recorder.Code, http.StatusCreated)
	}

	var response struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("Unmarshal() error = %v", err)
	}

	return response.ID
}
