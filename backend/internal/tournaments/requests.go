package tournaments

import "time"

type CreateTournamentRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	StartDate   string `json:"start_date" binding:"required"`
	EndDate     string `json:"end_date" binding:"required"`
}

func (r *CreateTournamentRequest) GetStartDate() (time.Time, error) {
	return time.Parse(time.RFC3339, r.StartDate)
}

func (r *CreateTournamentRequest) GetEndDate() (time.Time, error) {
	return time.Parse(time.RFC3339, r.EndDate)
}
