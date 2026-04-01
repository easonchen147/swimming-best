package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"swimming-best/backend/internal/config"
)

type Service struct {
	cookieName string
	secret     []byte
	admins     map[string]string
}

func New(cfg config.AuthConfig) (*Service, error) {
	if cfg.SessionSecret == "" {
		return nil, errors.New("session secret is required")
	}

	if cfg.CookieName == "" {
		return nil, errors.New("cookie name is required")
	}

	if len(cfg.Admins) == 0 {
		return nil, errors.New("at least one admin is required")
	}

	admins := make(map[string]string, len(cfg.Admins))
	for _, admin := range cfg.Admins {
		admins[admin.Username] = admin.PasswordHash
	}

	return &Service{
		cookieName: cfg.CookieName,
		secret:     []byte(cfg.SessionSecret),
		admins:     admins,
	}, nil
}

func (s *Service) Authenticate(username, password string) (string, bool) {
	passwordHash, ok := s.admins[username]
	if !ok {
		return "", false
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return "", false
	}

	return username, true
}

func (s *Service) WriteSessionCookie(w http.ResponseWriter, username string) error {
	if username == "" {
		return errors.New("username is required")
	}

	value := base64.RawURLEncoding.EncodeToString([]byte(username + "." + s.sign(username)))
	http.SetCookie(w, &http.Cookie{
		Name:     s.cookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60,
	})

	return nil
}

func (s *Service) ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func (s *Service) UsernameFromRequest(r *http.Request) (string, bool) {
	cookie, err := r.Cookie(s.cookieName)
	if err != nil {
		return "", false
	}

	decoded, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	if err != nil {
		return "", false
	}

	parts := strings.SplitN(string(decoded), ".", 2)
	if len(parts) != 2 {
		return "", false
	}

	username, signature := parts[0], parts[1]
	if username == "" {
		return "", false
	}

	if !hmac.Equal([]byte(signature), []byte(s.sign(username))) {
		return "", false
	}

	if _, ok := s.admins[username]; !ok {
		return "", false
	}

	return username, true
}

func (s *Service) sign(username string) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(username))
	return hex.EncodeToString(mac.Sum(nil))
}

func (s *Service) CookieName() string {
	return s.cookieName
}

func (s *Service) DebugString() string {
	return fmt.Sprintf("Service(cookie=%s, admins=%d)", s.cookieName, len(s.admins))
}

