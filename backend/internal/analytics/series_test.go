package analytics_test

import (
	"testing"
	"time"

	"swimming-best/backend/internal/analytics"
	"swimming-best/backend/internal/domain"
)

func TestBuildSeriesCalculatesRawPBAndTrendData(t *testing.T) {
	t.Helper()

	performances := []domain.Performance{
		{PerformedOn: "2026-03-01", TimeMS: 15000, ResultStatus: domain.ResultStatusValid, CreatedAt: time.Date(2026, 3, 1, 10, 0, 0, 0, time.UTC)},
		{PerformedOn: "2026-03-08", TimeMS: 14900, ResultStatus: domain.ResultStatusValid, CreatedAt: time.Date(2026, 3, 8, 10, 0, 0, 0, time.UTC)},
		{PerformedOn: "2026-03-15", TimeMS: 15100, ResultStatus: domain.ResultStatusValid, CreatedAt: time.Date(2026, 3, 15, 10, 0, 0, 0, time.UTC)},
		{PerformedOn: "2026-03-22", TimeMS: 14200, ResultStatus: domain.ResultStatusValid, CreatedAt: time.Date(2026, 3, 22, 10, 0, 0, 0, time.UTC)},
	}

	series := analytics.BuildSeries(performances)

	if len(series.Raw) != 4 {
		t.Fatalf("len(series.Raw) = %d, want 4", len(series.Raw))
	}

	if len(series.PB) != 4 {
		t.Fatalf("len(series.PB) = %d, want 4", len(series.PB))
	}

	if series.CurrentBestTimeMS != 14200 {
		t.Fatalf("series.CurrentBestTimeMS = %d, want %d", series.CurrentBestTimeMS, 14200)
	}

	if series.PB[2].TimeMS != 14900 {
		t.Fatalf("series.PB[2].TimeMS = %d, want %d", series.PB[2].TimeMS, 14900)
	}
}

