package config

import (
	"encoding/json"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/pterm/pterm"
)

type DatabaseConfig struct {
	DSN string `toml:"PostgresDSN"`
}

type BaseConfig struct {
	BaseURL string `toml:"BaseURL"`
	Debug   bool   `toml:"Debug"`
}

type VConfig struct {
	Database DatabaseConfig
	Base     BaseConfig
}

func ReadConfig(configPath string) (*VConfig, error) {
	_, err := os.Stat(configPath)
	if err != nil {
		return nil, err
	}
	// Add code to read and parse the config file here
	config := &VConfig{}
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}
	if _, err := toml.Decode(string(data), config); err != nil {
		return nil, err
	}

	if config.Base.Debug {
		j, _ := json.MarshalIndent(config, "", "  ")
		pterm.Println(string(j))
	}

	return config, nil
}
