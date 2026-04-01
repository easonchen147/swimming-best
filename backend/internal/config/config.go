package config

import (
	"errors"
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Auth     AuthConfig     `yaml:"auth"`
	App      AppConfig      `yaml:"app"`
}

type ServerConfig struct {
	Addr string `yaml:"addr"`
}

type DatabaseConfig struct {
	Path string `yaml:"path"`
}

type AuthConfig struct {
	SessionSecret string        `yaml:"session_secret"`
	CookieName    string        `yaml:"cookie_name"`
	Admins        []AdminConfig `yaml:"admins"`
}

type AdminConfig struct {
	Username     string `yaml:"username"`
	PasswordHash string `yaml:"password_hash"`
}

type AppConfig struct {
	Timezone      string `yaml:"timezone"`
	PublicBaseURL string `yaml:"public_base_url"`
}

func Load(path string) (Config, error) {
	var cfg Config

	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, fmt.Errorf("read config: %w", err)
	}

	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parse config: %w", err)
	}

	cfg.applyDefaults()
	if err := cfg.Validate(); err != nil {
		return cfg, err
	}

	return cfg, nil
}

func (c *Config) applyDefaults() {
	if c.Server.Addr == "" {
		c.Server.Addr = ":8080"
	}

	if c.Auth.CookieName == "" {
		c.Auth.CookieName = "swimming_best_admin"
	}

	if c.App.Timezone == "" {
		c.App.Timezone = "Asia/Shanghai"
	}
}

func (c Config) Validate() error {
	if c.Database.Path == "" {
		return errors.New("database.path is required")
	}

	if c.Auth.SessionSecret == "" {
		return errors.New("auth.session_secret is required")
	}

	if len(c.Auth.Admins) == 0 {
		return errors.New("auth.admins must contain at least one admin")
	}

	seen := map[string]struct{}{}
	for _, admin := range c.Auth.Admins {
		if admin.Username == "" {
			return errors.New("auth.admins.username is required")
		}

		if admin.PasswordHash == "" {
			return fmt.Errorf("auth.admins[%s].password_hash is required", admin.Username)
		}

		if _, exists := seen[admin.Username]; exists {
			return fmt.Errorf("duplicate admin username: %s", admin.Username)
		}

		seen[admin.Username] = struct{}{}
	}

	return nil
}

