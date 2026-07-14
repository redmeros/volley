package config

import "testing"

func TestReadConfig(t *testing.T) {
	configPath := "../../config.toml"
	config, err := ReadConfig(configPath)
	if err != nil {
		t.Fatalf("Failed to read config: %v", err)
	}
	if config.Base.BaseURL == "" {
		t.Fatalf("BaseURL is empty")
	}

	if config.Database.DSN == "" {
		t.Fatalf("DSN is empty")
	}
}
