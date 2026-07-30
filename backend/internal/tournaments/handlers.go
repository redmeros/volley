package tournaments

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pterm/pterm"
	"github.com/redmeros/volley/internal/app"
	"github.com/redmeros/volley/internal/users"
)

const moduleName = "tournaments"

func RegisterTournamentsHandlers(a *app.VApp) {
	pterm.Info.Printfln("Registering tournaments handlers")

	module := NewTournamentModule(a)

	a.Modules[moduleName] = module

	authMiddleware := users.AuthMiddleware(a)

	module.tournamentGroup.GET("/", listTournaments)
	module.tournamentGroup.POST("/", authMiddleware, createTournament)
	module.tournamentGroup.DELETE("/:id", authMiddleware, deleteTournament)
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
