package main

import (
	"log"

	"github.com/redmeros/volley/internal/config"
)

func main() {
	configPath := "./config.toml"
	_, err := config.ReadConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}
}
