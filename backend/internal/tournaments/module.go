package tournaments

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redmeros/volley/internal/app"
)

type TournamentModule struct {
	vapp            *app.VApp
	tournamentGroup *gin.RouterGroup
}

func NewTournamentModule(a *app.VApp) *TournamentModule {
	return &TournamentModule{
		vapp:            a,
		tournamentGroup: a.Api.Group("/tournaments"),
	}
}

func (m *TournamentModule) GetTournaments(ctx context.Context) ([]*Tournament, error) {
	conn, err := m.vapp.Pool.Acquire(ctx)
	// Implement the logic to get tournaments here
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	sql := `SELECT id, name, start_date, end_date FROM tournament`
	q, err := conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}
	defer q.Close()

	var tournaments []*Tournament
	for q.Next() {
		var t Tournament
		if err := q.Scan(&t.ID, &t.Name, &t.StartDate, &t.EndDate); err != nil {
			return nil, err
		}
		tournaments = append(tournaments, &t)
	}
	if tournaments == nil {
		return make([]*Tournament, 0), nil
	}
	return tournaments, nil
}

func (m *TournamentModule) CreateTournament(ctx context.Context, name string, description string, startDate time.Time, endDate time.Time, createdBy int) (*Tournament, error) {
	conn, err := m.vapp.Pool.Acquire(ctx)
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	sql := `INSERT INTO tournament (name, description, start_date, end_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	var id int
	err = conn.QueryRow(ctx, sql, name, description, startDate, endDate, createdBy).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &Tournament{
		ID:          id,
		Name:        name,
		Description: description,
		StartDate:   startDate,
		EndDate:     endDate,
		CreatedBy:   createdBy,
	}, nil
}
