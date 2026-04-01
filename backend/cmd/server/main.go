package main

import (
	"os"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/config"
	httpapi "swimming-best/backend/internal/http"
)

func main() {
	addr := os.Getenv("SWIMMING_BEST_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}

	authService, err := auth.New(config.AuthConfig{
		SessionSecret: "dev-session-secret",
		CookieName:    "swimming_best_admin",
		Admins: []config.AdminConfig{
			{
				Username:     "admin",
				PasswordHash: string(passwordHash),
			},
		},
	})
	if err != nil {
		panic(err)
	}

	if err := httpapi.NewRouter(authService).Run(addr); err != nil {
		panic(err)
	}
}
