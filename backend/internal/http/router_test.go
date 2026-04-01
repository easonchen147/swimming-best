package http_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/config"
	httpapi "swimming-best/backend/internal/http"
)

func TestRouterRejectsAnonymousAdminRequest(t *testing.T) {
	t.Helper()

	router := httpapi.NewRouter(newAuthService(t))

	request := httptest.NewRequest(http.MethodGet, "/api/admin/me", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("recorder.Code = %d, want %d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestRouterLoginCreatesAdminSession(t *testing.T) {
	t.Helper()

	router := httpapi.NewRouter(newAuthService(t))
	body, err := json.Marshal(map[string]string{
		"username": "coach",
		"password": "secret-pass",
	})
	if err != nil {
		t.Fatalf("Marshal() error = %v", err)
	}

	loginRequest := httptest.NewRequest(http.MethodPost, "/api/admin/login", bytes.NewReader(body))
	loginRequest.Header.Set("Content-Type", "application/json")
	loginRecorder := httptest.NewRecorder()

	router.ServeHTTP(loginRecorder, loginRequest)

	if loginRecorder.Code != http.StatusOK {
		t.Fatalf("loginRecorder.Code = %d, want %d", loginRecorder.Code, http.StatusOK)
	}

	response := loginRecorder.Result()
	if len(response.Cookies()) != 1 {
		t.Fatalf("len(response.Cookies()) = %d, want 1", len(response.Cookies()))
	}

	adminRequest := httptest.NewRequest(http.MethodGet, "/api/admin/me", nil)
	adminRequest.AddCookie(response.Cookies()[0])
	adminRecorder := httptest.NewRecorder()

	router.ServeHTTP(adminRecorder, adminRequest)

	if adminRecorder.Code != http.StatusOK {
		t.Fatalf("adminRecorder.Code = %d, want %d", adminRecorder.Code, http.StatusOK)
	}
}

func newAuthService(t *testing.T) *auth.Service {
	t.Helper()

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("secret-pass"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword() error = %v", err)
	}

	service, err := auth.New(config.AuthConfig{
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
		t.Fatalf("New() error = %v", err)
	}

	return service
}
