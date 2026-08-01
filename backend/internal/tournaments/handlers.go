package tournaments

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pterm/pterm"
	"github.com/redmeros/volley/internal/app"
	"github.com/redmeros/volley/internal/users"
)

const moduleName = "tournaments"

type tournamentRequest struct {
	CreatedAt   string `json:"created_at"`
	CreatedBy   int    `json:"created_by"`
	Description string `json:"description"`
	EndDate     string `json:"end_date"`
	StartDate   string `json:"start_date"`
	Name        string `json:"name"`
	ID          int    `json:"id"`
}

// YYYY-MM-DD
func tryParseISODate(dateStr string) (time.Time, error) {
	if len(dateStr) < 10 {
		return time.Time{}, fmt.Errorf("date string too short")
	}
	cells := strings.Split(dateStr, "-")
	if len(cells) < 3 {
		return time.Time{}, fmt.Errorf("date string does not have enough components")
	}

	year, err := strconv.Atoi(cells[0])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid year: %v", err)
	}
	month, err := strconv.Atoi(cells[1])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid month: %v", err)
	}
	day, err := strconv.Atoi(cells[2])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid day: %v", err)
	}

	return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC), nil
}

func (t *tournamentRequest) ToTournament() (*Tournament, error) {
	te := &Tournament{
		ID:          t.ID,
		Name:        t.Name,
		Description: t.Description,
		CreatedBy:   t.CreatedBy,
	}

	startDate, err := tryParseISODate(t.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date: %w", err)
	}

	endDate, err := tryParseISODate(t.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end date: %w", err)
	}

	createdAt, _ := tryParseISODate(t.CreatedAt)

	te.StartDate = startDate
	te.EndDate = endDate
	te.CreatedAt = createdAt

	return te, nil
}

func RegisterTournamentsHandlers(a *app.VApp) {
	pterm.Info.Printfln("Registering tournaments handlers")

	module := NewTournamentModule(a)

	a.Modules[moduleName] = module

	authMiddleware := users.AuthMiddleware(a)

	module.tournamentGroup.GET("/", listTournaments)
	module.tournamentGroup.POST("/", authMiddleware, createTournament)
	module.tournamentGroup.DELETE("/:id", authMiddleware, deleteTournament)
	module.tournamentGroup.GET("/:id", getTournament)
	module.tournamentGroup.PUT("/:id", authMiddleware, putTournament)
}

func getTournament(c *gin.Context) {
	idstr, ok := c.Params.Get("id")
	if !ok {
		c.JSON(400, gin.H{"error": "No tournament ID provided"})
		return
	}
	id, err := strconv.Atoi(idstr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Wrong id format"})
		return
	}
	a := app.GetAppFromContext(c)
	m := getTournamentModule(a)

	tournament, err := m.GetTournament(c, id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, tournament)
}

func getTournamentModule(a *app.VApp) *TournamentModule {
	module, ok := a.Modules[moduleName]
	if !ok {
		panic("tournament module is not initialized")
	}
	tournamentModule, ok := module.(*TournamentModule)
	if !ok {
		panic("tournament module has wrong type")
	}
	return tournamentModule
}

func deleteTournament(c *gin.Context) {
	tournamentID := c.Param("id")
	if len(tournamentID) == 0 {
		c.JSON(400, gin.H{"error": "No tournament ID provided"})
		return
	}

	id, err := strconv.Atoi(tournamentID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Wrong id format"})
		return
	}

	app := app.GetAppFromContext(c)
	module := getTournamentModule(app)
	claims, err := users.GetClaimsFromContext(c)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if claims.Role != "admin" {
		c.JSON(403, gin.H{"error": "only admin users can delete tournaments"})
		return
	}

	userID, err := claims.GetUserID()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get user ID from claims"})
		return
	}
	err = module.DeleteTournament(ctx, id, userID)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func putTournament(c *gin.Context) {
	tournamentIDstring := c.Param("id")
	if len(tournamentIDstring) == 0 {
		c.JSON(400, gin.H{"error": "No tournament ID provided"})
		return
	}

	id, err := strconv.Atoi(tournamentIDstring)
	if err != nil {
		c.JSON(400, gin.H{"error": "Wrong id format"})
		return
	}

	app := app.GetAppFromContext(c)
	module := getTournamentModule(app)
	claims, err := users.GetClaimsFromContext(c)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	if claims.Role != "admin" {
		c.JSON(403, gin.H{"error": "only admin users can update tournaments"})
		return
	}

	userID, err := claims.GetUserID()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get user ID from claims"})
		return
	}

	tournamentReq := &tournamentRequest{}
	err = c.ShouldBindJSON(tournamentReq)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if id != tournamentReq.ID {
		c.JSON(400, gin.H{"error": "Tournament ID in URL does not match ID in request body"})
		return
	}

	tournament, err := tournamentReq.ToTournament()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err = module.UpdateTournament(c, tournament, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, tournament)
}

func createTournament(c *gin.Context) {
	var req CreateTournamentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	app := app.GetAppFromContext(c)
	module := getTournamentModule(app)
	claims, err := users.GetClaimsFromContext(c)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if claims.Role != "admin" {
		c.JSON(403, gin.H{"error": "only admin users can create tournaments"})
		return
	}

	userID, err := claims.GetUserID()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get user ID from claims"})
		return
	}

	startDate, err := req.GetStartDate()
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid start date"})
		return
	}
	endDate, err := req.GetEndDate()
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid end date"})
		return
	}

	t, err := module.CreateTournament(ctx, req.Name, req.Description, startDate, endDate, userID)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, t)
}

func listTournaments(c *gin.Context) {
	app := app.GetAppFromContext(c)
	module := getTournamentModule(app)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	list, err := module.GetTournaments(ctx)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}
