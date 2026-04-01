package auth_test

import (
	"net/http/httptest"
	"testing"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/config"
)

func TestServiceAuthenticatesConfiguredAdmin(t *testing.T) {
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

	if _, ok := service.Authenticate("coach", "secret-pass"); !ok {
		t.Fatal("Authenticate() ok = false, want true")
	}

	if _, ok := service.Authenticate("coach", "wrong-pass"); ok {
		t.Fatal("Authenticate() ok = true, want false for invalid password")
	}
}

func TestServiceIssuesAndValidatesSessionCookie(t *testing.T) {
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

	recorder := httptest.NewRecorder()
	if err := service.WriteSessionCookie(recorder, "coach"); err != nil {
		t.Fatalf("WriteSessionCookie() error = %v", err)
	}

	response := recorder.Result()
	if len(response.Cookies()) != 1 {
		t.Fatalf("len(response.Cookies()) = %d, want 1", len(response.Cookies()))
	}

	request := httptest.NewRequest("GET", "/api/admin/me", nil)
	request.AddCookie(response.Cookies()[0])

	username, ok := service.UsernameFromRequest(request)
	if !ok {
		t.Fatal("UsernameFromRequest() ok = false, want true")
	}

	if username != "coach" {
		t.Fatalf("username = %q, want %q", username, "coach")
	}
}

