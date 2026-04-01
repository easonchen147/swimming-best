package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/google/uuid"

	"swimming-best/backend/internal/domain"
)

var (
	ErrConflict = errors.New("conflict")
	ErrNotFound = errors.New("not found")
)

type queryExecutor interface {
	ExecContext(context.Context, string, ...any) (sql.Result, error)
	QueryContext(context.Context, string, ...any) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...any) *sql.Row
}

type SQLiteRepository struct {
	db   *sql.DB
	exec queryExecutor
}

func NewSQLiteRepository(db *sql.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db, exec: db}
}

func (r *SQLiteRepository) WithTx(ctx context.Context, fn func(*SQLiteRepository) error) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	txRepo := &SQLiteRepository{db: r.db, exec: tx}
	if err := fn(txRepo); err != nil {
		_ = tx.Rollback()
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}

	return nil
}

func (r *SQLiteRepository) CreateSwimmer(ctx context.Context, params domain.CreateSwimmerParams) (domain.Swimmer, error) {
	now := time.Now().UTC()
	swimmer := domain.Swimmer{
		ID:             uuid.NewString(),
		Slug:           buildSlug(firstNonEmpty(params.Nickname, params.RealName)),
		RealName:       params.RealName,
		Nickname:       params.Nickname,
		PublicNameMode: params.PublicNameMode,
		IsPublic:       params.IsPublic,
		AvatarURL:      params.AvatarURL,
		BirthYear:      params.BirthYear,
		TeamName:       params.TeamName,
		Notes:          params.Notes,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if swimmer.RealName == "" {
		return swimmer, errors.New("real name is required")
	}

	if swimmer.Nickname == "" {
		swimmer.Nickname = swimmer.RealName
	}

	if swimmer.PublicNameMode == "" {
		swimmer.PublicNameMode = domain.PublicNameModeNickname
	}

	_, err := r.exec.ExecContext(
		ctx,
		`INSERT INTO swimmers (
			id, slug, real_name, nickname, public_name_mode, is_public, avatar_url, birth_year, team_name, notes, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		swimmer.ID,
		swimmer.Slug,
		swimmer.RealName,
		swimmer.Nickname,
		string(swimmer.PublicNameMode),
		boolToInt(swimmer.IsPublic),
		swimmer.AvatarURL,
		swimmer.BirthYear,
		swimmer.TeamName,
		swimmer.Notes,
		swimmer.CreatedAt.Format(time.RFC3339),
		swimmer.UpdatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return swimmer, normalizeError(err)
	}

	return swimmer, nil
}

func (r *SQLiteRepository) ListSwimmers(ctx context.Context) ([]domain.Swimmer, error) {
	rows, err := r.exec.QueryContext(ctx, `
		SELECT id, slug, real_name, nickname, public_name_mode, is_public, avatar_url, birth_year, team_name, notes, created_at, updated_at
		FROM swimmers
		ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query swimmers: %w", err)
	}
	defer rows.Close()

	var swimmers []domain.Swimmer
	for rows.Next() {
		swimmer, err := scanSwimmer(rows)
		if err != nil {
			return nil, err
		}
		swimmers = append(swimmers, swimmer)
	}

	return swimmers, rows.Err()
}

func (r *SQLiteRepository) GetSwimmer(ctx context.Context, id string) (domain.Swimmer, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT id, slug, real_name, nickname, public_name_mode, is_public, avatar_url, birth_year, team_name, notes, created_at, updated_at
		FROM swimmers
		WHERE id = ?
	`, id)
	return scanSwimmer(row)
}

func (r *SQLiteRepository) CreateEvent(ctx context.Context, params domain.CreateEventParams) (domain.Event, error) {
	now := time.Now().UTC()
	event := domain.Event{
		ID:          uuid.NewString(),
		PoolLengthM: params.PoolLengthM,
		DistanceM:   params.DistanceM,
		Stroke:      params.Stroke,
		EffortType:  params.EffortType,
		DisplayName: params.DisplayName,
		SortOrder:   params.SortOrder,
		IsActive:    params.IsActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if event.PoolLengthM <= 0 || event.DistanceM <= 0 {
		return event, errors.New("event dimensions must be positive")
	}

	if event.Stroke == "" || event.EffortType == "" {
		return event, errors.New("stroke and effort type are required")
	}

	if event.DisplayName == "" {
		event.DisplayName = fmt.Sprintf("%dm %s %s", event.DistanceM, event.Stroke, event.EffortType)
	}

	if !params.IsActive {
		event.IsActive = true
	}

	_, err := r.exec.ExecContext(
		ctx,
		`INSERT INTO events (
			id, pool_length_m, distance_m, stroke, effort_type, display_name, sort_order, is_active, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		event.ID,
		event.PoolLengthM,
		event.DistanceM,
		string(event.Stroke),
		string(event.EffortType),
		event.DisplayName,
		event.SortOrder,
		boolToInt(event.IsActive),
		event.CreatedAt.Format(time.RFC3339),
		event.UpdatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return event, normalizeError(err)
	}

	return event, nil
}

func (r *SQLiteRepository) GetEvent(ctx context.Context, id string) (domain.Event, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT id, pool_length_m, distance_m, stroke, effort_type, display_name, sort_order, is_active, created_at, updated_at
		FROM events
		WHERE id = ?
	`, id)
	return scanEvent(row)
}

func (r *SQLiteRepository) CreateContext(ctx context.Context, params domain.CreateRecordContextParams) (domain.RecordContext, error) {
	now := time.Now().UTC()
	recordContext := domain.RecordContext{
		ID:          uuid.NewString(),
		SourceType:  params.SourceType,
		Title:       params.Title,
		PerformedOn: params.PerformedOn,
		Location:    params.Location,
		PublicNote:  params.PublicNote,
		AdminNote:   params.AdminNote,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if recordContext.SourceType == "" {
		recordContext.SourceType = domain.SourceTypeSingle
	}
	if recordContext.Title == "" {
		recordContext.Title = "Quick Entry"
	}
	if recordContext.PerformedOn == "" {
		recordContext.PerformedOn = now.Format("2006-01-02")
	}

	_, err := r.exec.ExecContext(
		ctx,
		`INSERT INTO record_contexts (
			id, source_type, title, performed_on, location, public_note, admin_note, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		recordContext.ID,
		string(recordContext.SourceType),
		recordContext.Title,
		recordContext.PerformedOn,
		recordContext.Location,
		recordContext.PublicNote,
		recordContext.AdminNote,
		recordContext.CreatedAt.Format(time.RFC3339),
		recordContext.UpdatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return recordContext, normalizeError(err)
	}

	return recordContext, nil
}

func (r *SQLiteRepository) GetContext(ctx context.Context, id string) (domain.RecordContext, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT id, source_type, title, performed_on, location, public_note, admin_note, created_at, updated_at
		FROM record_contexts
		WHERE id = ?
	`, id)
	return scanContext(row)
}

func (r *SQLiteRepository) CreatePerformance(ctx context.Context, params domain.CreatePerformanceParams) (domain.Performance, error) {
	now := time.Now().UTC()
	performance := domain.Performance{
		ID:           uuid.NewString(),
		ContextID:    params.ContextID,
		SwimmerID:    params.SwimmerID,
		EventID:      params.EventID,
		TimeMS:       params.TimeMS,
		PerformedOn:  params.PerformedOn,
		ResultStatus: params.ResultStatus,
		PublicNote:   params.PublicNote,
		AdminNote:    params.AdminNote,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if performance.ResultStatus == "" {
		performance.ResultStatus = domain.ResultStatusValid
	}
	if performance.PerformedOn == "" {
		performance.PerformedOn = now.Format("2006-01-02")
	}

	_, err := r.exec.ExecContext(
		ctx,
		`INSERT INTO performances (
			id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status, public_note, admin_note, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		performance.ID,
		performance.ContextID,
		performance.SwimmerID,
		performance.EventID,
		performance.TimeMS,
		performance.PerformedOn,
		string(performance.ResultStatus),
		performance.PublicNote,
		performance.AdminNote,
		performance.CreatedAt.Format(time.RFC3339),
		performance.UpdatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return performance, normalizeError(err)
	}

	return performance, nil
}

func (r *SQLiteRepository) CreatePerformances(ctx context.Context, params []domain.CreatePerformanceParams) ([]domain.Performance, error) {
	performances := make([]domain.Performance, 0, len(params))
	for _, param := range params {
		performance, err := r.CreatePerformance(ctx, param)
		if err != nil {
			return nil, err
		}
		performances = append(performances, performance)
	}
	return performances, nil
}

func (r *SQLiteRepository) BestTimeMS(ctx context.Context, swimmerID, eventID string) (int64, bool, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT MIN(time_ms)
		FROM performances
		WHERE swimmer_id = ? AND event_id = ? AND result_status = ?
	`, swimmerID, eventID, string(domain.ResultStatusValid))

	var best sql.NullInt64
	if err := row.Scan(&best); err != nil {
		return 0, false, fmt.Errorf("query best time: %w", err)
	}

	if !best.Valid {
		return 0, false, nil
	}

	return best.Int64, true, nil
}

func (r *SQLiteRepository) CreateGoal(ctx context.Context, params domain.CreateGoalParams) (domain.Goal, error) {
	now := time.Now().UTC()
	goal := domain.Goal{
		ID:             uuid.NewString(),
		SwimmerID:      params.SwimmerID,
		EventID:        params.EventID,
		ParentGoalID:   params.ParentGoalID,
		Horizon:        params.Horizon,
		Title:          params.Title,
		TargetTimeMS:   params.TargetTimeMS,
		TargetDate:     params.TargetDate,
		BaselineTimeMS: params.BaselineTimeMS,
		Status:         params.Status,
		IsPublic:       params.IsPublic,
		PublicNote:     params.PublicNote,
		AdminNote:      params.AdminNote,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if goal.Horizon == "" {
		goal.Horizon = domain.GoalHorizonShort
	}
	if goal.Status == "" {
		goal.Status = domain.GoalStatusActive
	}

	_, err := r.exec.ExecContext(
		ctx,
		`INSERT INTO goals (
			id, swimmer_id, event_id, parent_goal_id, horizon, title, target_time_ms, target_date, baseline_time_ms, status, is_public, public_note, admin_note, achieved_at, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		goal.ID,
		goal.SwimmerID,
		goal.EventID,
		goal.ParentGoalID,
		string(goal.Horizon),
		goal.Title,
		goal.TargetTimeMS,
		goal.TargetDate,
		goal.BaselineTimeMS,
		string(goal.Status),
		boolToInt(goal.IsPublic),
		goal.PublicNote,
		goal.AdminNote,
		goal.AchievedAt,
		goal.CreatedAt.Format(time.RFC3339),
		goal.UpdatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return goal, normalizeError(err)
	}

	return goal, nil
}

func (r *SQLiteRepository) ListPublicSwimmers(ctx context.Context) ([]domain.Swimmer, error) {
	rows, err := r.exec.QueryContext(ctx, `
		SELECT id, slug, real_name, nickname, public_name_mode, is_public, avatar_url, birth_year, team_name, notes, created_at, updated_at
		FROM swimmers
		WHERE is_public = 1 AND public_name_mode != ?
		ORDER BY created_at ASC
	`, string(domain.PublicNameModeHidden))
	if err != nil {
		return nil, fmt.Errorf("query public swimmers: %w", err)
	}
	defer rows.Close()

	var swimmers []domain.Swimmer
	for rows.Next() {
		swimmer, err := scanSwimmer(rows)
		if err != nil {
			return nil, err
		}
		swimmers = append(swimmers, swimmer)
	}

	return swimmers, rows.Err()
}

func (r *SQLiteRepository) GetPublicSwimmerBySlug(ctx context.Context, slug string) (domain.Swimmer, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT id, slug, real_name, nickname, public_name_mode, is_public, avatar_url, birth_year, team_name, notes, created_at, updated_at
		FROM swimmers
		WHERE slug = ? AND is_public = 1 AND public_name_mode != ?
	`, slug, string(domain.PublicNameModeHidden))
	return scanSwimmer(row)
}

func (r *SQLiteRepository) ListPerformancesForSwimmerEvent(ctx context.Context, swimmerID, eventID string) ([]domain.Performance, error) {
	rows, err := r.exec.QueryContext(ctx, `
		SELECT id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status, public_note, admin_note, created_at, updated_at
		FROM performances
		WHERE swimmer_id = ? AND event_id = ?
		ORDER BY performed_on ASC, created_at ASC
	`, swimmerID, eventID)
	if err != nil {
		return nil, fmt.Errorf("query swimmer performances: %w", err)
	}
	defer rows.Close()

	var performances []domain.Performance
	for rows.Next() {
		performance, err := scanPerformance(rows)
		if err != nil {
			return nil, err
		}
		performances = append(performances, performance)
	}

	return performances, rows.Err()
}

func (r *SQLiteRepository) ListGoalsForSwimmerEvent(ctx context.Context, swimmerID, eventID string) ([]domain.Goal, error) {
	rows, err := r.exec.QueryContext(ctx, `
		SELECT id, swimmer_id, event_id, parent_goal_id, horizon, title, target_time_ms, target_date, baseline_time_ms, status, is_public, public_note, admin_note, achieved_at, created_at, updated_at
		FROM goals
		WHERE swimmer_id = ? AND event_id = ?
		ORDER BY target_date ASC, created_at ASC
	`, swimmerID, eventID)
	if err != nil {
		return nil, fmt.Errorf("query goals: %w", err)
	}
	defer rows.Close()

	var goals []domain.Goal
	for rows.Next() {
		goal, err := scanGoal(rows)
		if err != nil {
			return nil, err
		}
		goals = append(goals, goal)
	}

	return goals, rows.Err()
}

func (r *SQLiteRepository) ListPerformancesForEventAndSwimmers(ctx context.Context, eventID string, swimmerIDs []string) ([]domain.Performance, error) {
	if len(swimmerIDs) == 0 {
		return nil, nil
	}

	args := make([]any, 0, len(swimmerIDs)+1)
	args = append(args, eventID)
	for _, swimmerID := range swimmerIDs {
		args = append(args, swimmerID)
	}

	query := fmt.Sprintf(`
		SELECT id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status, public_note, admin_note, created_at, updated_at
		FROM performances
		WHERE event_id = ? AND swimmer_id IN (%s)
		ORDER BY swimmer_id ASC, performed_on ASC, created_at ASC
	`, placeholders(len(swimmerIDs)))

	rows, err := r.exec.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query compare performances: %w", err)
	}
	defer rows.Close()

	var performances []domain.Performance
	for rows.Next() {
		performance, err := scanPerformance(rows)
		if err != nil {
			return nil, err
		}
		performances = append(performances, performance)
	}

	return performances, rows.Err()
}

func (r *SQLiteRepository) StrongestEventID(ctx context.Context, swimmerID string) (string, error) {
	row := r.exec.QueryRowContext(ctx, `
		SELECT event_id
		FROM performances
		WHERE swimmer_id = ? AND result_status = ?
		GROUP BY event_id
		ORDER BY MIN(time_ms) ASC
		LIMIT 1
	`, swimmerID, string(domain.ResultStatusValid))

	var eventID string
	if err := row.Scan(&eventID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("query strongest event: %w", err)
	}

	return eventID, nil
}

func scanSwimmer(scanner interface{ Scan(...any) error }) (domain.Swimmer, error) {
	var swimmer domain.Swimmer
	var isPublic int64
	var publicNameMode string
	var createdAt string
	var updatedAt string

	err := scanner.Scan(
		&swimmer.ID,
		&swimmer.Slug,
		&swimmer.RealName,
		&swimmer.Nickname,
		&publicNameMode,
		&isPublic,
		&swimmer.AvatarURL,
		&swimmer.BirthYear,
		&swimmer.TeamName,
		&swimmer.Notes,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return swimmer, ErrNotFound
		}
		return swimmer, err
	}

	swimmer.PublicNameMode = domain.PublicNameMode(publicNameMode)
	swimmer.IsPublic = isPublic == 1
	swimmer.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	swimmer.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt)

	return swimmer, nil
}

func scanEvent(scanner interface{ Scan(...any) error }) (domain.Event, error) {
	var event domain.Event
	var stroke string
	var effortType string
	var isActive int64
	var createdAt string
	var updatedAt string

	err := scanner.Scan(
		&event.ID,
		&event.PoolLengthM,
		&event.DistanceM,
		&stroke,
		&effortType,
		&event.DisplayName,
		&event.SortOrder,
		&isActive,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return event, ErrNotFound
		}
		return event, err
	}

	event.Stroke = domain.Stroke(stroke)
	event.EffortType = domain.EffortType(effortType)
	event.IsActive = isActive == 1
	event.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	event.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt)

	return event, nil
}

func scanContext(scanner interface{ Scan(...any) error }) (domain.RecordContext, error) {
	var recordContext domain.RecordContext
	var sourceType string
	var createdAt string
	var updatedAt string

	err := scanner.Scan(
		&recordContext.ID,
		&sourceType,
		&recordContext.Title,
		&recordContext.PerformedOn,
		&recordContext.Location,
		&recordContext.PublicNote,
		&recordContext.AdminNote,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return recordContext, ErrNotFound
		}
		return recordContext, err
	}

	recordContext.SourceType = domain.SourceType(sourceType)
	recordContext.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	recordContext.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt)
	return recordContext, nil
}

func scanPerformance(scanner interface{ Scan(...any) error }) (domain.Performance, error) {
	var performance domain.Performance
	var resultStatus string
	var createdAt string
	var updatedAt string

	err := scanner.Scan(
		&performance.ID,
		&performance.ContextID,
		&performance.SwimmerID,
		&performance.EventID,
		&performance.TimeMS,
		&performance.PerformedOn,
		&resultStatus,
		&performance.PublicNote,
		&performance.AdminNote,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return performance, ErrNotFound
		}
		return performance, err
	}

	performance.ResultStatus = domain.ResultStatus(resultStatus)
	performance.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	performance.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt)
	return performance, nil
}

func scanGoal(scanner interface{ Scan(...any) error }) (domain.Goal, error) {
	var goal domain.Goal
	var horizon string
	var status string
	var isPublic int64
	var createdAt string
	var updatedAt string

	err := scanner.Scan(
		&goal.ID,
		&goal.SwimmerID,
		&goal.EventID,
		&goal.ParentGoalID,
		&horizon,
		&goal.Title,
		&goal.TargetTimeMS,
		&goal.TargetDate,
		&goal.BaselineTimeMS,
		&status,
		&isPublic,
		&goal.PublicNote,
		&goal.AdminNote,
		&goal.AchievedAt,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return goal, ErrNotFound
		}
		return goal, err
	}

	goal.Horizon = domain.GoalHorizon(horizon)
	goal.Status = domain.GoalStatus(status)
	goal.IsPublic = isPublic == 1
	goal.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	goal.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt)
	return goal, nil
}

func normalizeError(err error) error {
	if err == nil {
		return nil
	}
	if strings.Contains(err.Error(), "UNIQUE constraint failed") {
		return fmt.Errorf("%w: %v", ErrConflict, err)
	}
	if strings.Contains(err.Error(), "FOREIGN KEY constraint failed") {
		return fmt.Errorf("%w: %v", ErrNotFound, err)
	}
	return err
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func buildSlug(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	var builder strings.Builder
	lastDash := false
	for _, r := range value {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			builder.WriteRune(r)
			lastDash = false
		case unicode.IsSpace(r) || r == '-' || r == '_':
			if !lastDash {
				builder.WriteRune('-')
				lastDash = true
			}
		}
	}

	slug := strings.Trim(builder.String(), "-")
	if slug == "" {
		slug = "swimmer"
	}

	return slug + "-" + uuid.NewString()[:8]
}

func placeholders(count int) string {
	values := make([]string, count)
	for index := range values {
		values[index] = "?"
	}
	return strings.Join(values, ", ")
}
