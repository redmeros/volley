package app

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/graceful"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pterm/pterm"
	"github.com/redmeros/volley/internal/config"
)

type appKey struct{}

type VApp struct {
	Config  *config.VConfig
	Pool    *pgxpool.Pool
	Router  *graceful.Graceful
	API     *gin.RouterGroup
	Modules map[string]any
}

func (v *VApp) Run(ctx context.Context) error {
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	defer v.Router.Close()

	pterm.Info.Printfln("Starting server on %s", v.Config.Base.BaseURL)

	if err := v.Router.RunWithContext(ctx); err != nil && err != context.Canceled {
		pterm.Error.Printfln("Error during running router %v", err)
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	if err := v.Close(shutdownCtx); err != nil {
		pterm.Warning.Printfln("Shutdown was canceled before resources closed: %v", err)
	} else {
		pterm.Success.Printfln("Shutdown completed successfully")
	}

	return nil
}

func (v *VApp) Close(ctx context.Context) error {
	if ctx == nil {
		ctx = context.Background()
	}

	if v.Pool == nil {
		return nil
	}

	done := make(chan struct{})
	go func() {
		v.Pool.Close()
		if v.Config.Base.Debug {
			pterm.Debug.Printfln("Database connection closed")
		}
		close(done)
	}()

	select {
	case <-done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (v *VApp) RegisterModule(registerFunc func(a *VApp)) {
	registerFunc(v)
}

func NewVApp(config *config.VConfig) (*VApp, error) {
	if config == nil {
		return nil, fmt.Errorf("no config provided")
	}

	pgxpool, err := pgxpool.New(context.Background(), config.Database.DSN)
	if err != nil {
		return nil, fmt.Errorf("failed to create database pool: %w", err)
	}

	v := &VApp{
		Config:  config,
		Pool:    pgxpool,
		Modules: make(map[string]any),
	}

	c, canc := context.WithTimeout(context.Background(), 1*time.Second)
	defer canc()

	err = v.Pool.Ping(c)
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	r, err := graceful.Default()
	if err != nil {
		return nil, fmt.Errorf("failed to create router: %w", err)
	}
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "QUERY"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Content-Length", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        19 * time.Hour,
	}))
	v.Router = r

	v.API = v.Router.Group("/api")

	v.API.Use(gin.Recovery())
	v.API.Use(func(c *gin.Context) {
		c.Set(appKey{}, v)
		c.Next()
	})

	return v, nil
}

func GetAppFromContext(c *gin.Context) *VApp {
	app, ok := c.MustGet(appKey{}).(*VApp)
	if !ok {
		panic("app not found in context")
	}
	return app
}
