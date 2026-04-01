package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "modernc.org/sqlite"
)

func Open(path string) (*sql.DB, error) {
	if err := ensureParentDir(path); err != nil {
		return nil, err
	}

	sqlite, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	sqlite.SetMaxOpenConns(1)

	for _, pragma := range []string{
		"PRAGMA foreign_keys = ON;",
		"PRAGMA journal_mode = WAL;",
	} {
		if _, err := sqlite.Exec(pragma); err != nil {
			return nil, fmt.Errorf("apply pragma %q: %w", pragma, err)
		}
	}

	return sqlite, nil
}

func Migrate(sqlite *sql.DB) error {
	statements := strings.Split(schemaSQL, ";")
	for _, statement := range statements {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}

		if _, err := sqlite.Exec(statement); err != nil {
			return fmt.Errorf("migrate statement %q: %w", statement, err)
		}
	}

	return nil
}

func ensureParentDir(path string) error {
	dir := filepath.Dir(path)
	if dir == "." || dir == "" {
		return nil
	}

	return os.MkdirAll(dir, 0o755)
}

const schemaSQL = `
CREATE TABLE IF NOT EXISTS swimmers (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  real_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  public_name_mode TEXT NOT NULL,
  is_public INTEGER NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  birth_year INTEGER NOT NULL DEFAULT 0,
  team_name TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  pool_length_m INTEGER NOT NULL,
  distance_m INTEGER NOT NULL,
  stroke TEXT NOT NULL,
  effort_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(pool_length_m, distance_m, stroke, effort_type)
);

CREATE TABLE IF NOT EXISTS record_contexts (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  performed_on TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS performances (
  id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL,
  swimmer_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  performed_on TEXT NOT NULL,
  result_status TEXT NOT NULL,
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (context_id) REFERENCES record_contexts(id) ON DELETE CASCADE,
  FOREIGN KEY (swimmer_id) REFERENCES swimmers(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  swimmer_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  parent_goal_id TEXT NOT NULL DEFAULT '',
  horizon TEXT NOT NULL,
  title TEXT NOT NULL,
  target_time_ms INTEGER NOT NULL,
  target_date TEXT NOT NULL,
  baseline_time_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  is_public INTEGER NOT NULL,
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  achieved_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (swimmer_id) REFERENCES swimmers(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS context_tags (
  context_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (context_id, tag_id),
  FOREIGN KEY (context_id) REFERENCES record_contexts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performance_tags (
  performance_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (performance_id, tag_id),
  FOREIGN KEY (performance_id) REFERENCES performances(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performances_swimmer_event_date
  ON performances (swimmer_id, event_id, performed_on);

CREATE INDEX IF NOT EXISTS idx_goals_swimmer_event_date
  ON goals (swimmer_id, event_id, target_date);
`
