package main

import (
	"context"
	"log"

	"github.com/pterm/pterm"
	"github.com/redmeros/volley/internal/app"
	"github.com/redmeros/volley/internal/config"
	"github.com/redmeros/volley/internal/users"
)

func main() {
	configPath := "./config.toml"
	cfg, err := config.ReadConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}

	a, err := app.NewVApp(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize app: %v", err)
	}

	a.RegisterModule(users.RegisterUsersHandlers)
	ctx := context.Background()

	pterm.Info.Printfln("Starting application with config: %+v", cfg)

	a.Run(ctx)
}
