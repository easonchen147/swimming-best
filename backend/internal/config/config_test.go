package config_test

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/config"
)

func TestLoadConfigParsesYamlFile(t *testing.T) {
	t.Helper()

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("secret-pass"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword() error = %v", err)
	}

	tempDir := t.TempDir()
	configPath := filepath.Join(tempDir, "config.yaml")
	content := fmt.Sprintf(`
server:
  addr: ":9090"
database:
  path: "./data/test.db"
auth:
  session_secret: "test-secret"
  cookie_name: "swimming_best_admin"
  admins:
    - username: "coach"
      password_hash: "%s"
app:
  timezone: "Asia/Shanghai"
  public_base_url: "http://localhost:3000"
`, string(passwordHash))

	if err := os.WriteFile(configPath, []byte(content), 0o600); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	cfg, err := config.Load(configPath)
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}

	if cfg.Server.Addr != ":9090" {
		t.Fatalf("cfg.Server.Addr = %q, want %q", cfg.Server.Addr, ":9090")
	}

	if cfg.Database.Path != "./data/test.db" {
		t.Fatalf("cfg.Database.Path = %q, want %q", cfg.Database.Path, "./data/test.db")
	}

	if cfg.Auth.CookieName != "swimming_best_admin" {
		t.Fatalf("cfg.Auth.CookieName = %q, want %q", cfg.Auth.CookieName, "swimming_best_admin")
	}

	if len(cfg.Auth.Admins) != 1 {
		t.Fatalf("len(cfg.Auth.Admins) = %d, want 1", len(cfg.Auth.Admins))
	}

	if cfg.Auth.Admins[0].Username != "coach" {
		t.Fatalf("cfg.Auth.Admins[0].Username = %q, want %q", cfg.Auth.Admins[0].Username, "coach")
	}
}

func TestLoadConfigRejectsMissingAdmins(t *testing.T) {
	t.Helper()

	tempDir := t.TempDir()
	configPath := filepath.Join(tempDir, "config.yaml")
	content := `
server:
  addr: ":8080"
database:
  path: "./data/test.db"
auth:
  session_secret: "test-secret"
  cookie_name: "swimming_best_admin"
  admins: []
`

	if err := os.WriteFile(configPath, []byte(content), 0o600); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	if _, err := config.Load(configPath); err == nil {
		t.Fatal("Load() error = nil, want validation error")
	}
}

