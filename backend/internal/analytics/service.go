package analytics

import (
	"sort"

	"swimming-best/backend/internal/domain"
)

type Service struct{}

type SeriesPoint struct {
	PerformedOn string `json:"performedOn"`
	TimeMS      int64  `json:"timeMs"`
}

type Series struct {
	Raw               []SeriesPoint `json:"raw"`
	PB                []SeriesPoint `json:"pb"`
	Trend             []SeriesPoint `json:"trend"`
	CurrentBestTimeMS int64         `json:"currentBestTimeMs"`
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) BuildSeries(performances []domain.Performance) Series {
	return BuildSeries(performances)
}

func BuildSeries(performances []domain.Performance) Series {
	filtered := make([]domain.Performance, 0, len(performances))
	for _, performance := range performances {
		if performance.ResultStatus == domain.ResultStatusValid {
			filtered = append(filtered, performance)
		}
	}

	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].PerformedOn == filtered[j].PerformedOn {
			return filtered[i].CreatedAt.Before(filtered[j].CreatedAt)
		}
		return filtered[i].PerformedOn < filtered[j].PerformedOn
	})

	raw := make([]SeriesPoint, 0, len(filtered))
	pb := make([]SeriesPoint, 0, len(filtered))
	trend := make([]SeriesPoint, 0, len(filtered))

	var currentBest int64
	var moving []int64
	for index, performance := range filtered {
		raw = append(raw, SeriesPoint{PerformedOn: performance.PerformedOn, TimeMS: performance.TimeMS})

		if index == 0 || performance.TimeMS < currentBest {
			currentBest = performance.TimeMS
		}
		pb = append(pb, SeriesPoint{PerformedOn: performance.PerformedOn, TimeMS: currentBest})

		moving = append(moving, performance.TimeMS)
		if len(moving) > 3 {
			moving = moving[1:]
		}
		trend = append(trend, SeriesPoint{
			PerformedOn: performance.PerformedOn,
			TimeMS:      average(moving),
		})
	}

	return Series{
		Raw:               raw,
		PB:                pb,
		Trend:             trend,
		CurrentBestTimeMS: currentBest,
	}
}

func average(values []int64) int64 {
	if len(values) == 0 {
		return 0
	}

	var total int64
	for _, value := range values {
		total += value
	}

	return total / int64(len(values))
}
