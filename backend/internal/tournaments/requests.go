package tournaments

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type CreateTournamentRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	StartDate   string `json:"start_date" binding:"required"`
	EndDate     string `json:"end_date" binding:"required"`
}

func (r *CreateTournamentRequest) GetStartDate() (time.Time, error) {
	return parsIsoeDateOnly(r.StartDate)
}

func (r *CreateTournamentRequest) GetEndDate() (time.Time, error) {
	return parsIsoeDateOnly(r.EndDate)
}

func parsIsoeDateOnly(dateStr string) (time.Time, error) {
	data := strings.Split(dateStr, "-")
	if len(data) != 3 {
		return time.Time{}, errors.New("invalid date format, expected YYYY-MM-DD")
	}
	year, err := strconv.Atoi(data[0])
	if err != nil {
		return time.Time{}, fmt.Errorf("error parsing year %w", err)
	}

	month, err := strconv.Atoi(data[1])
	if err != nil {
		return time.Time{}, fmt.Errorf("error parsing month %w", err)
	}

	day, err := strconv.Atoi(data[2])
	if err != nil {
		return time.Time{}, fmt.Errorf("error parsing day %w", err)
	}

	t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	return t, nil
}
